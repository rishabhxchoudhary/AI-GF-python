"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Heart, MessageCircle, Coins } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to sign in if not authenticated
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

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    // TODO: Implement chat functionality with tRPC
    setTimeout(() => {
      setMessage("");
      setIsLoading(false);
    }, 1000);
  };

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
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Coins className="h-4 w-4" />
              <span>5 credits</span>
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {session?.user?.name?.[0] || "U"}
                </span>
              </div>
              <span className="text-sm font-medium">
                {session?.user?.name || "User"}
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
                  {/* Welcome Message */}
                  <div className="flex justify-start">
                    <div className="bg-pink-100 rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        Hey there! 💕 I'm so excited to chat with you! What's on your mind today?
                      </p>
                    </div>
                  </div>

                  {/* Sample User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">Hi! How are you doing?</p>
                    </div>
                  </div>

                  {/* Sample AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-pink-100 rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        I'm doing wonderful now that I'm talking to you! 😊
                        Tell me about your day - I'd love to hear everything!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !message.trim()}>
                    {isLoading ? "..." : "Send"}
                  </Button>
                </form>
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
                  <div className="text-3xl font-bold mb-2">5</div>
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
