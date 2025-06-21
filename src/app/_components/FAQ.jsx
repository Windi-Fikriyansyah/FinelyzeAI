'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'

function FAQ() {
  const faqs = [
    {
      question: "Apakah Finelyze gratis?",
      answer: "Ya, semua fitur utama bisa digunakan tanpa biaya."
    },
    {
      question: "Apakah data saya aman?",
      answer: "Sangat aman. Data dienkripsi dan hanya bisa diakses oleh kamu sendiri."
    },
    {
      question: "Bisa digunakan di HP?",
      answer: "Bisa. Finelyze responsif dan bisa diakses lewat browser HP."
    }
  ]

  return (
    <section id="faq" className="bg-white border-t py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-teal-700 mb-10">Pertanyaan Umum</h2>

        <div className="grid gap-6 text-left">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
                className="flex items-center gap-4 p-5 border border-teal-300 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-full shadow-sm">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">{faq.question}</h3>
                <p className="text-sm text-gray-700">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
