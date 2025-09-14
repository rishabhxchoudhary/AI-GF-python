"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [testMessage, setTestMessage] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);

  // Test tRPC queries
  const {
    data: userCredits,
    error: creditsError,
    refetch: refetchCredits,
  } = api.credits.getCreditStatus.useQuery();

  const { data: conversations, error: conversationsError } =
    api.chat.getConversationHistory.useQuery({ limit: 5 });

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setTestResults((prev) => [
        ...prev,
        {
          type: "success",
          message: "Message sent successfully",
          data,
        },
      ]);
      refetchCredits();
    },
    onError: (error) => {
      setTestResults((prev) => [
        ...prev,
        {
          type: "error",
          message: error.message,
          data: error.data,
        },
      ]);
    },
  });

  const runTest = () => {
    setTestResults([]);
    if (testMessage.trim()) {
      sendMessageMutation.mutate({ message: testMessage.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Authentication Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Authentication Status
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={
                      status === "authenticated" ? "default" : "destructive"
                    }
                  >
                    {status}
                  </Badge>
                </p>
                <p>
                  <strong>User ID:</strong>{" "}
                  {session?.user?.id || "Not available"}
                </p>
                <p>
                  <strong>User Email:</strong>{" "}
                  {session?.user?.email || "Not available"}
                </p>
                <p>
                  <strong>User Name:</strong>{" "}
                  {session?.user?.name || "Not available"}
                </p>
                <p>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </p>
              </div>
            </div>

            {/* Credits Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Credits Status</h3>
              {creditsError ? (
                <div className="text-red-600">
                  <p>
                    <strong>Error:</strong> {creditsError.message}
                  </p>
                  <pre className="text-xs mt-2 bg-red-50 p-2 rounded">
                    {JSON.stringify(creditsError.data, null, 2)}
                  </pre>
                </div>
              ) : userCredits ? (
                <div className="space-y-1">
                  <p>
                    <strong>Current Credits:</strong>{" "}
                    {userCredits.balance.current}
                  </p>
                  <p>
                    <strong>Total Spent:</strong> $
                    {userCredits.balance.lifetime_spent}
                  </p>
                  <p>
                    <strong>Lifetime Purchased:</strong>{" "}
                    {userCredits.balance.lifetime_purchased}
                  </p>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>

            {/* Conversation History */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Recent Conversations
              </h3>
              {conversationsError ? (
                <div className="text-red-600">
                  <p>
                    <strong>Error:</strong> {conversationsError.message}
                  </p>
                  <pre className="text-xs mt-2 bg-red-50 p-2 rounded">
                    {JSON.stringify(conversationsError.data, null, 2)}
                  </pre>
                </div>
              ) : conversations ? (
                <div>
                  <p>
                    <strong>Total Messages:</strong>{" "}
                    {conversations.messages.length}
                  </p>
                  <div className="max-h-32 overflow-y-auto bg-gray-100 p-2 rounded text-xs">
                    {conversations.messages.length > 0 ? (
                      conversations.messages.map((msg: any) => (
                        <div key={msg.id} className="mb-1">
                          <strong>{msg.role}:</strong>{" "}
                          {msg.content.substring(0, 50)}...
                        </div>
                      ))
                    ) : (
                      <p>No messages yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>

            {/* Test Message Sending */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Test Message Sending
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message..."
                  className="w-full p-2 border rounded"
                />
                <Button
                  onClick={runTest}
                  disabled={
                    sendMessageMutation.isPending || !testMessage.trim()
                  }
                >
                  {sendMessageMutation.isPending
                    ? "Sending..."
                    : "Send Test Message"}
                </Button>
              </div>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs ${
                        result.type === "error"
                          ? "bg-red-50 text-red-800"
                          : "bg-green-50 text-green-800"
                      }`}
                    >
                      <p>
                        <strong>{result.type.toUpperCase()}:</strong>{" "}
                        {result.message}
                      </p>
                      {result.data && (
                        <pre className="mt-1 text-xs">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data */}
            <details>
              <summary className="text-lg font-semibold cursor-pointer">
                Raw Session Data
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify({ session, status }, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
