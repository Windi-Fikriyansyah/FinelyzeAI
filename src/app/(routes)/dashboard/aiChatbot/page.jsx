"use client"
import React, { useState } from "react"

function AIChatBotPage() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Kamu adalah Finelyze, asisten keuangan yang ramah, menyenangkan, dan menjawab dengan jelas serta singkat. Tugasmu adalah membantu user mengelola keuangan pribadi dengan cara yang mudah dimengerti.",
    },
    {
      role: "assistant",
      content: "Hai! Aku FinBot 🤖. Ada yang bisa aku bantu terkait keuanganmu?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: newMessages,
        }),
      })

      const data = await response.json()
      const reply = data.choices?.[0]?.message
      if (reply) {
        setMessages([...newMessages, reply])
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen p-6 bg-bg-white">
      <div className="flex flex-col h-full bg-white shadow rounded-xl">
        <h1 className="text-2xl font-bold p-4 border-b text-emerald-600 text-center">🤖 Finelyze AI Chatbot</h1>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50">
          {messages
            .filter((msg) => msg.role !== "system")
            .map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end flex-row-reverse" : "justify-start"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-400 text-white flex items-center justify-center font-bold text-sm">
                  {msg.role === "user" ? "🧑" : "🤖"}
                </div>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${
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
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIChatBotPage
