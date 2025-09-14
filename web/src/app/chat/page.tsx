"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Heart, MessageCircle, Coins, Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC queries and mutations (must be called before any conditionals)
  const { data: userCredits, refetch: refetchCredits } =
    api.credits.getCreditStatus.useQuery();
  const { data: conversations, refetch: refetchConversations } =
    api.chat.getConversationHistory.useQuery({
      limit: 50,
    });

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchConversations();
      refetchCredits();
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      if (error.data?.code === "FORBIDDEN") {
        // Redirect to pricing if insufficient credits
        setTimeout(() => {
          window.location.href = "/pricing";
        }, 2000);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  // Redirect to sign in if not authenticated (bypass in development)
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 animate-pulse text-pink-500 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && process.env.NODE_ENV !== "development") {
    redirect("/auth/signin");
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    if (!userCredits || userCredits.balance.current < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to send a message.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      message: message.trim(),
    });
  };

  const messages = conversations?.messages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="font-bold">AI Girlfriend</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Badge
              variant={
                userCredits && userCredits.balance.current < 5
                  ? "destructive"
                  : "secondary"
              }
              className="flex items-center space-x-1"
            >
              <Coins className="h-4 w-4" />
              <span>{userCredits?.balance.current || 0} credits</span>
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {session?.user?.name?.[0] || "U"}
                </span>
              </div>
              <span className="text-sm font-medium">
                {session?.user?.name || "Test User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Chat Area */}
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-pink-500" />
                <span>Chat with your AI Girlfriend</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    /* Welcome Message */
                    <div className="flex justify-start">
                      <div className="bg-pink-100 rounded-2xl px-4 py-2 max-w-xs">
                        <p className="text-sm">
                          Hey there! 💕 I&apos;m so excited to chat with you!
                          What&apos;s on your mind today?
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2 max-w-xs ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-pink-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Loading indicator */}
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-pink-100 rounded-2xl px-4 py-2 max-w-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                {userCredits && userCredits.balance.current === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      You&apos;re out of credits! Purchase more to continue
                      chatting.
                    </p>
                    <Button asChild>
                      <Link href="/pricing">Buy Credits</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                      maxLength={500}
                    />
                    <Button
                      type="submit"
                      disabled={
                        sendMessageMutation.isPending || !message.trim()
                      }
                      size="icon"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Each message costs 1 credit
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span>Credits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {userCredits?.balance.current || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Credits remaining
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/pricing">Buy More Credits</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personality Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your AI Girlfriend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Emma</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Relationship Stage: Getting to know each other
                  </p>
                  <Button variant="outline" className="w-full">
                    Customize Personality
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  View Conversation History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Relationship Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Memory & Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
