'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'

function FAQ() {
  const faqs = [
    {
      question: "Apakah Finelyze AI gratis?",
      answer: "Ya, semua fitur bisa digunakan tanpa biaya."
    },
    {
      question: "Apakah data tersimpan dan selalu bisa diakses?",
      answer: "Ya, selama akun kamu aktif dan terhubung internet, data kamu tersimpan dan bisa diakses kapan saja."
    },
    {
      question: "Apakah bisa digunakan di HP?",
      answer: "Bisa. Finelyze responsif bisa diakses lewat browser dekstop maupun mobile."
    }
  ]

  return (
    <section id="faq" className="bg-gradient-to-br from-white via-[#E6FAF3] to-white border-t py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Pertanyaan Umum</h2>

        <div className="grid gap-6 text-left">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-5 border border-teal-300 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              data-aos-duration="800"
            >
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
