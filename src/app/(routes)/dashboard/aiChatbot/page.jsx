"use client";
import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

function AIChatBotContent() {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hai! Aku Finelyze 🤖. Senang bisa bantu kamu hari ini. Ada yang ingin kamu bahas soal keuanganmu? 💸✨",
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !messages) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Gagal parsing JSON:", text);
        throw new Error("Invalid JSON from API");
      }

      const reply = data.reply;
      console.log("Response dari Finbot:", reply);

      if (reply?.content) {
        setMessages([...newMessages, reply]);
      }
    } catch (err) {
      console.error("Gagal kirim ke Finbot:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen p-6 bg-bg-white">
      <div className="flex flex-col h-full bg-white shadow rounded-xl">
        <h1 className="text-2xl font-bold p-4 border-b text-emerald-600 text-center">
          🤖 Finbot AI Chatbot
        </h1>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-emerald-50">
          {messages &&
            messages
              .filter((msg) => msg.role !== "system")
              .map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === "user"
                      ? "justify-end flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-400 text-white flex items-center justify-center font-bold text-sm">
                    {msg.role === "user" ? "🧑" : "🤖"}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl shadow ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-emerald-300 text-white flex items-center justify-center font-bold text-sm">
                🤖
              </div>
              <div className="italic animate-pulse">Finelyze sedang mengetik...</div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu tentang keuanganmu..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-110 hover:shadow-xl transition-all duration-450 ease-in-out"
          >
            {loading ? "..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Komponen utama: mengecek login pakai Clerk
export default function AIChatBotPage() {
  return (
    <>
      <SignedIn>
        <AIChatBotContent />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
