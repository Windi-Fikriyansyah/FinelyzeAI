'use client'

import React from 'react'
import Image from "next/image"
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

function Header() {
  const { isSignedIn } = useUser()

  return (
    <header className="backdrop-blur-md bg-white/60 border-b border-teal-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
        
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Finelyze Logo"
            width={160}
            height={100}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-2 rounded-md transition text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          >
            Beranda
          </Link>
          <Link
            href="#fitur"
            className="px-3 py-2 rounded-md transition text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          >
            Fitur
          </Link>
          <Link
            href="#faq"
            className="px-3 py-2 rounded-md transition text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          >
            FAQ
          </Link>
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="ml-2 bg-gradient-to-tr from-[#2FB98D] via-[#1AAE94] to-[#127C71] text-white px-4 py-2 rounded-md shadow hover:brightness-105 transition"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
