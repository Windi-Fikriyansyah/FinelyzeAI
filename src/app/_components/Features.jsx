'use client'

import { BrainCog, Wallet, BarChart3, ShieldCheck } from 'lucide-react'

const features = [
  {
    title: "Pantau Keuangan Harian",
    desc: "Catat pengeluaran harianmu secara cepat dan mudah, semua langsung tersimpan rapi.",
    icon: Wallet,
  },
  {
    title: "Smart Budgeting",
    desc: "Buat batas dana per kategori dan dapatkan notifikasi saat pengeluaran melebihi batas.",
    icon: BarChart3,
  },
  {
    title: "Saran AI Pintar",
    desc: "Finelyze AI menganalisis keuanganmu dan memberikan saran hemat berbasis data.",
    icon: BrainCog,
  },
  {
    title: "Privasi Aman",
    desc: "Semua data tersimpan aman dengan autentikasi dan enkripsi terbaik.",
    icon: ShieldCheck,
  },
]

export default function Features() {
  return (
    <section id="fitur" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Fitur Utama Finelyze
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-12">
          Dirancang untuk membantumu mengelola keuangan pribadi dengan lebih cerdas, efisien, dan aman.
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#F2FBF7] to-white p-6 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#2FB98D] to-[#127C71] text-white mb-4">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-600">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
