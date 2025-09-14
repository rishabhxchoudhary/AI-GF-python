"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Heart, MessageCircle, Coins, Send, Zap, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useStreamingChat } from "~/hooks/useStreamingChat";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isAITyping,
    currentStreamingMessage,
    isLoading,
    error,
    userCredits,
    sendMessage,
    sendBurstMessages,
    triggerProactiveMessage,
    checkAndSendBurstMessages,
    clearError,
  } = useStreamingChat();

  // Demo burst messages for testing
  const handleBurstDemo = () => {
    sendBurstMessages([
      "Oh wait! I just remembered something...",
      "I saw this really cute video of a puppy today! 🐶",
      "It reminded me of how adorable you are! 💕",
    ]);
  };

  // Intelligent burst message check
  const handleIntelligentBurst = () => {
    checkAndSendBurstMessages();
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, currentStreamingMessage]);

  // Handle form submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isAITyping) return;

    await sendMessage(message);
    setMessage("");
  };

  // Handle authentication states
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 animate-pulse text-pink-500 mx-auto mb-4" />
          <p>Loading your conversation...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && process.env.NODE_ENV !== "development") {
    redirect("/auth/signin");
  }

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

      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Chat Area */}
          <Card className="flex flex-col h-[calc(100vh-8rem)]">
            <CardHeader className="border-b flex-shrink-0 pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-pink-500" />
                  <span>Chat with Emma</span>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerProactiveMessage}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Check
                  </Button>
                  {process.env.NODE_ENV === "development" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBurstDemo}
                        className="text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Demo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleIntelligentBurst}
                        className="text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Smart
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Messages Area */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto min-h-0 chat-container"
              >
                <div className="space-y-4 pb-4">
                  {/* Welcome Message */}
                  {messages.length === 0 && !isAITyping && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl px-4 py-3 max-w-xs lg:max-w-sm shadow-sm">
                        <p className="text-sm">
                          Hey there! 💕 I&apos;m Emma, your AI girlfriend.
                          I&apos;m so excited to chat with you!
                        </p>
                        <p className="text-sm mt-2 text-muted-foreground">
                          What&apos;s on your mind today?
                        </p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {messages.map((msg, index) => (
                    <div
                      key={`${msg.id}-${index}`}
                      className={`flex message-enter ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-xs lg:max-w-sm shadow-sm ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white ml-12"
                            : "bg-gradient-to-r from-pink-100 to-purple-100 text-gray-800 mr-12"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                          {msg.metadata?.burst && (
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3 text-pink-500" />
                              <span className="text-xs text-pink-500">
                                Burst
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Streaming AI Response */}
                  {isAITyping && currentStreamingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl px-4 py-3 max-w-xs lg:max-w-sm shadow-sm mr-12">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {currentStreamingMessage}
                          <span className="inline-block w-0.5 h-4 bg-pink-500 ml-1 streaming-cursor"></span>
                        </p>
                        <p className="text-xs opacity-70 mt-2">typing...</p>
                      </div>
                    </div>
                  )}

                  {/* Typing indicator (initial) */}
                  {isAITyping && !currentStreamingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl px-4 py-3 max-w-xs shadow-sm mr-12">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-pink-400 rounded-full typing-dot"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full typing-dot"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full typing-dot"></div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">
                            Emma is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="flex justify-center">
                      <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-3 max-w-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-red-600 flex-1">{error}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearError}
                            className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-4 flex-shrink-0 bg-white/50">
                {userCredits && userCredits.balance.current === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      You&apos;re out of credits! Purchase more to continue
                      chatting with Emma.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/pricing">
                        <Coins className="h-4 w-4 mr-2" />
                        Buy Credits
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-2"
                    >
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message... (Press Enter to send)"
                        disabled={isLoading || isAITyping}
                        className="flex-1 bg-white chat-input"
                        maxLength={500}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || isAITyping || !message.trim()}
                        size="icon"
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Each message costs 1 credit • Press Enter to send
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.length}/500 characters
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Credits Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span>Credits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {userCredits?.balance.current || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Credits remaining
                  </p>
                  {userCredits && userCredits.balance.current < 10 && (
                    <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs text-orange-600">
                        Running low on credits!
                      </p>
                    </div>
                  )}
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Link href="/pricing">Buy More Credits</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personality Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Emma - Your AI Girlfriend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 mx-auto mb-3 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Emma</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Relationship Stage: Getting to know each other
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                    >
                      View Personality
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                    >
                      Relationship Status
                    </Button>
                    {process.env.NODE_ENV === "development" && (
                      <Button
                        variant="outline"
                        className="w-full text-sm bg-purple-50 border-purple-200 hover:bg-purple-100"
                        size="sm"
                        onClick={handleIntelligentBurst}
                      >
                        🤖 Smart Burst Check
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Chat Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Messages today:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last active:</span>
                  <span className="font-medium">
                    {isAITyping ? "Typing..." : "Now"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mood:</span>
                  <span className="font-medium">
                    {isAITyping ? "🤔 Thinking" : "😊 Happy"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">
                    {isLoading || isAITyping ? "⚡ Active" : "💕 Ready"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  💭 Memory & Preferences
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  📊 Relationship Progress
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  🎭 Customize Personality
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                  onClick={triggerProactiveMessage}
                >
                  🔔 Get Surprise Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
