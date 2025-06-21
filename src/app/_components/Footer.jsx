'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#2FB98D] to-[#127C71] mt-10">
      <div className="max-w-7xl mx-auto px-5 py-6 flex justify-center items-center text-sm text-center text-gray-600">
        
        {/* Copyright */}
        <div className="text-xs text-white">
          © {new Date().getFullYear()} Finelyze AI by Naffa. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
