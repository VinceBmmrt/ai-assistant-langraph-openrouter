"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

const Page = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );

  const getResponse = async (question: string) => {
    setLoading(true); // Démarre le loader
    try {
      const updatedMessages = [
        ...messages,
        { role: "user", content: question },
      ];
      setMessages(updatedMessages);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;

      if (content) {
        setResponse(content);
        setMessages((prev) => [...prev, { role: "assistant", content }]);
      } else {
        setResponse("No valid response received from AI.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error retrieving AI response.");
    } finally {
      setLoading(false); // Arrête le loader
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      getResponse(input);
      setInput("");
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>

      {!session ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      ) : (
        <div className="mb-4">
          <p className="mb-2">Hello, {session.user?.name}</p>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-black font-semibold mb-2">Conversation:</h2>
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded ${
                m.role === "user" ? "bg-blue-400" : "bg-gray-400"
              }`}
            >
              <strong>{m.role === "user" ? "You:" : "AI:"}</strong>
              <p>{m.content}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>

      {loading && (
        <div className="flex justify-center items-center mt-4">
          <div className="animate-spin border-t-4 border-blue-600 border-solid rounded-full w-12 h-12"></div>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded mt-4">
        <h2 className="text-black font-semibold mb-2">AI Response:</h2>
        <p className="text-black bg-white p-2 rounded shadow">{response}</p>
      </div>
    </div>
  );
};

export default Page;
