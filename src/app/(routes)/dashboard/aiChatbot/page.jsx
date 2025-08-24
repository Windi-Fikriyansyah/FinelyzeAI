"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { CircleUserRound } from "lucide-react";

const STORAGE_KEY = "finbot_chat_history";

function AIChatBotContent() {
  const { isSignedIn } = useUser();
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const rekomendasi = [
    "Bagaimana cara mengatur budget bulanan?",
    "Apakah pengeluaranku bulan ini tergolong boros?",
    "Berapa rata-rata pengeluaran harian saya bulan ini?"
  ];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Hai! Aku FinBot. Siap bantu menjawab seputar keuangan!"
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
        body: JSON.stringify({
          messages: newMessages,
          month: currentMonth,
          year: currentYear
        }),
      });

      const data = await res.json();
      const reply = data.reply;
      if (reply?.content) {
        setMessages([...newMessages, reply]);
      }
    } catch (err) {
      console.error("Gagal kirim ke Finbot:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        role: "assistant",
        content: "Hai! Aku FinBot. Siap bantu menjawab seputar keuangan!"
      }
    ]);
  };

  const handleRekomendasiClick = (text) => {
    setInput(text);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-emerald-200 via-emerald-50 to-emerald-100 flex flex-col">
      
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white shadow-lg flex justify-center items-center relative">
        <h1 className="text-xl font-bold tracking-wide">FinBot</h1>

        <button
          onClick={handleClearChat}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-3 py-1.5 rounded-full text-sm shadow transition-transform hover:scale-105"
          aria-label="Clear chat"
          type="button"
        >
          Hapus
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages &&
          messages
            .filter((msg) => msg.role !== "system")
            .map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="min-w-10 min-h-10 w-10 h-10 rounded-full bg-emerald-300 flex items-center justify-center overflow-hidden shadow">
                    {msg.role === "user" ? (
                      <CircleUserRound className="w-6 h-6 text-emerald-800" />
                    ) : (
                      <Image src="/icon-chatbot.png" alt="Bot" width={30} height={30} />
                    )}
                  </div>

                  <div
                    className={`px-4 py-3 rounded-2xl shadow-md text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-500 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-emerald-300 flex items-center justify-center">
              <Image src="/icon-chatbot.png" alt="Bot" width={40} height={40} />
            </div>
            <div className="italic">FinBot sedang mengetik...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages?.length <= 2 && (
        <div className="px-4 py-2 bg-white/80 backdrop-blur-md border-t border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-2">Coba tanya salah satu ini:</div>
          <div className="flex flex-wrap gap-2">
            {rekomendasi.map((text, i) => (
              <button
                key={i}
                onClick={() => handleRekomendasiClick(text)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm shadow hover:scale-105 transition-transform"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-white/80 backdrop-blur-md flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan apa saja tentang keuanganmu..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-5 py-2 rounded-full text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:scale-105 transition-all duration-200 text-sm shadow"
        >
          {loading ? "..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}

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
