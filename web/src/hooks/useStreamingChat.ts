import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { toast } from "./use-toast";
import { useSession } from "next-auth/react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  metadata?: any;
}

interface StreamingChatState {
  messages: ChatMessage[];
  isAITyping: boolean;
  currentStreamingMessage: string;
  isLoading: boolean;
  error: string | null;
}

export function useStreamingChat() {
  const { data: session } = useSession();
  const [state, setState] = useState<StreamingChatState>({
    messages: [],
    isAITyping: false,
    currentStreamingMessage: "",
    isLoading: false,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const proactiveCheckInterval = useRef<NodeJS.Timeout>();
  const lastMessageTime = useRef<Date>(new Date());

  // Load conversation history
  const { data: conversations, refetch: refetchConversations } =
    api.chat.getConversationHistory.useQuery({
      limit: 50,
    });

  const { data: userCredits, refetch: refetchCredits } =
    api.credits.getCreditStatus.useQuery();

  // Simulate streaming response (replace with real streaming later)
  const startStreamingResponse = useCallback((fullResponse: string) => {
    setState((prev) => ({
      ...prev,
      isAITyping: true,
      currentStreamingMessage: "",
    }));

    const words = fullResponse.split(" ");
    let currentIndex = 0;

    const streamInterval = setInterval(
      () => {
        if (currentIndex < words.length) {
          setState((prev) => ({
            ...prev,
            currentStreamingMessage:
              prev.currentStreamingMessage +
              (currentIndex === 0 ? "" : " ") +
              words[currentIndex],
          }));
          currentIndex++;
        } else {
          clearInterval(streamInterval);

          // Add completed message to chat
          const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, aiMessage],
            currentStreamingMessage: "",
            isAITyping: false,
          }));

          lastMessageTime.current = new Date();
        }
      },
      100 + Math.random() * 50,
    ); // Vary typing speed for realism
  }, []);

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: (response) => {
      refetchCredits();
      refetchConversations();

      // Start streaming the AI response
      if (response.messages && response.messages[0]) {
        startStreamingResponse(response.messages[0].content);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isAITyping: false,
        currentStreamingMessage: "",
        error: error.message || "Failed to send message",
      }));

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      if (error.data?.code === "FORBIDDEN") {
        setTimeout(() => {
          window.location.href = "/pricing";
        }, 2000);
      }
    },
  });

  // Load messages from conversation history
  useEffect(() => {
    if (conversations?.messages) {
      setState((prev) => ({
        ...prev,
        messages: conversations.messages,
      }));
    }
  }, [conversations]);

  // Handle proactive messaging
  const checkForProactiveMessage = useCallback(async () => {
    try {
      const now = new Date();
      const timeSinceLastMessage =
        now.getTime() - lastMessageTime.current.getTime();
      const minutesSinceLastMessage = timeSinceLastMessage / (1000 * 60);

      // Check for proactive message if it's been more than 10 minutes
      if (minutesSinceLastMessage > 10) {
        try {
          const response = await fetch("/api/chat/proactive", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result) {
              setState((prev) => ({
                ...prev,
                messages: [...prev.messages, result],
              }));
              lastMessageTime.current = now;
            }
          }
        } catch (error) {
          console.error("Error checking for proactive message:", error);
        }
      }
    } catch (error) {
      console.error("Error checking for proactive message:", error);
    }
  }, []);

  // Set up proactive message checking
  useEffect(() => {
    // Check every 5 minutes for proactive messages
    proactiveCheckInterval.current = setInterval(
      checkForProactiveMessage,
      5 * 60 * 1000,
    );

    return () => {
      if (proactiveCheckInterval.current) {
        clearInterval(proactiveCheckInterval.current);
      }
    };
  }, [checkForProactiveMessage]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Send message using tRPC
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || state.isLoading || !session?.user) return;

      if (!userCredits || userCredits.balance.current < 1) {
        toast({
          title: "Insufficient Credits",
          description: "You need at least 1 credit to send a message.",
          variant: "destructive",
        });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Immediately add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: message.trim(),
        timestamp: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      lastMessageTime.current = new Date();

      // Send message to backend
      sendMessageMutation.mutate({
        message: message.trim(),
      });
    },
    [state.isLoading, session?.user, userCredits, sendMessageMutation],
  );

  // Send multiple AI messages (burst mechanism) using Server-Sent Events
  const sendBurstMessages = useCallback(
    async (messages: string[], delayBetweenMs = 2000) => {
      if (!session?.user || messages.length === 0) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch("/api/chat/burst", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            delayMs: delayBetweenMs,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        // Parse streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(line.slice(6));

                switch (eventData.type) {
                  case "burst_message":
                    setState((prev) => ({
                      ...prev,
                      messages: [...prev.messages, eventData.data],
                    }));
                    lastMessageTime.current = new Date();
                    break;

                  case "burst_complete":
                    setState((prev) => ({ ...prev, isLoading: false }));
                    break;

                  case "error":
                    setState((prev) => ({
                      ...prev,
                      error: eventData.data.message,
                      isLoading: false,
                    }));
                    toast({
                      title: "Burst Error",
                      description: eventData.data.message,
                      variant: "destructive",
                    });
                    break;
                }
              } catch (parseError) {
                console.error("Error parsing burst SSE data:", parseError);
              }
            }
          }
        }

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to send burst messages",
        }));

        toast({
          title: "Burst Error",
          description: error.message || "Failed to send burst messages",
          variant: "destructive",
        });
      }
    },
    [session?.user],
  );

  // Manually trigger proactive message check
  const triggerProactiveMessage = useCallback(() => {
    checkForProactiveMessage();
  }, [checkForProactiveMessage]);

  // Check if burst messages should be sent and send them
  const checkAndSendBurstMessages = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/chat/burst", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const burstData = await response.json();

      if (burstData.shouldSendBurst && burstData.messages.length > 0) {
        console.log(`Sending burst messages: ${burstData.reason}`);
        await sendBurstMessages(burstData.messages);
      }
    } catch (error: any) {
      console.error("Error checking for burst messages:", error);
    }
  }, [session?.user, sendBurstMessages]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Add message manually (for testing)
  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  return {
    // State
    messages: state.messages,
    isAITyping: state.isAITyping,
    currentStreamingMessage: state.currentStreamingMessage,
    isLoading: state.isLoading,
    error: state.error,
    userCredits,

    // Actions
    sendMessage,
    sendBurstMessages,
    triggerProactiveMessage,
    checkAndSendBurstMessages,
    clearError,
    addMessage,

    // Utilities
    refetchConversations,
    refetchCredits,
  };
}
