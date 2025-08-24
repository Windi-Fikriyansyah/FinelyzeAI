import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { Sparkles } from 'lucide-react'

function Hero() {
  return (
    <section className="bg-gradient-to-br from-white via-[#E6FAF3] to-white">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:flex lg:items-center lg:justify-between">
        
        <div className="max-w-xl text-center lg:text-left" data-aos="fade-right">
          <div className="inline-flex items-center mb-4 text-teal-600 font-medium bg-teal-100 px-3 py-1 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 mr-1" />
            Smart Financial Tools
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Atur Keuanganmu <br />
            <span className="bg-gradient-to-r from-[#2FB98D] to-[#127C71] bg-clip-text text-transparent">
              Bersama Finelyze
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-700">
            Catat pemasukan, pengeluaran, kelola tabungan, dan dapatkan insight keuangan dari AI dalam satu aplikasi.          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">            
            <a
              href="#fitur"
              className="px-6 py-3 rounded-lg border border-teal-600 text-teal-700 font-semibold hover:bg-teal-50 transition"
            >
              Lihat Fitur
            </a>
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#2FB98D] to-[#127C71] shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>

        <div className="mt-10 lg:mt-0 lg:ml-12" data-aos="fade-left">
          <Image
            src="/dashboard.png"
            alt="Dashboard Finelyze"
            width={600}
            height={400}
            className="rounded-xl shadow-xl border border-teal-100"
            priority
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
