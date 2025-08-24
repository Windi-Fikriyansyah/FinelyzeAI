'use client'

import Image from 'next/image'
import { BarChart3, PiggyBank, Sparkles, Bot } from 'lucide-react'

const features = [
  {
    title: 'Manajemen Keuangan',
    desc: 'Catat setiap transaksi harian dan pantau keuanganmu secara real-time.',
    icon: BarChart3,
  },
  {
    title: 'Tabungan',
    desc: 'Buat target, pantau progres, dan capai impian finansialmu tepat waktu.',
    icon: PiggyBank,
  },
  {
    title: 'Finelyze AI',
    desc: 'AI akan menganalisis keuanganmu dan memberi rekomendasi cerdas.',
    icon: Sparkles,
  },
  {
    title: 'FinBot',
    desc: 'Tanya apapun soal keuangan. Chatbot siap jadi mentor finansialmu.',
    icon: Bot,
  },
]

const steps = [
  {
    title: '1. Mulai dari Budgeting',
    desc: 'Atur alokasi dana sesuai kebutuhanmu, lalu mulailah mencatat setiap transaksi harian.',
    image: '/pengeluaran.jpeg',
  },
  {
    title: '2. Lihat Pola Keuanganmu',
    desc: 'Semakin rutin mencatat, semakin jelas alur keuanganmu. Finelyze menampilkannya lewat grafik dan insight yang mudah dipahami.',
    image: '/dashboard-bar.jpeg',
  },
  {
    title: '3. Tentukan Tujuan',
    desc: 'Punya impian? Buat target tabungan dan pantau progresnya. Finelyze bantu kamu tetap on-track hingga tercapai.',
    image: '/tabungan.jpeg',
  },
  {
    title: '4. Dibantu AI & FinBot Cerdas',
    desc: 'Dapatkan saran keuangan dari Finelyze AI dan tanya langsung ke FinBot kapan pun kamu butuh bantuan soal keuangan.',
    image: '/chatbot.jpeg',
  },
]

export default function Features() {
  return (
    <>
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fitur Utama
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            Finelyze membantumu mengelola keuangan dengan lebih cerdas dan efisien.
          </p>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#F2FBF7] to-white p-6 rounded-2xl border border-teal-600 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#2FB98D] to-[#127C71] text-white mb-4">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="langkah" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-20">
            4 Langkah Agar Keuanganmu Lebih Terkontrol
          </h2>

          <div className="space-y-20">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative w-full lg:w-1/2">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={600}
                    height={360}
                    className="rounded-xl shadow-lg border border-teal-100 w-full h-auto object-cover"
                  />
                </div>

                <div className="w-full lg:w-1/2">
                  <h4 className="text-2xl font-bold text-teal-800 mb-4">{step.title}</h4>
                  <p className="text-gray-800 text-base">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
