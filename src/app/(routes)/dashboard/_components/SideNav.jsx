'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { BotMessageSquare, LayoutGrid, PiggyBank, HandCoins, ShoppingCart  } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const SafeUserButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.UserButton), {
  ssr: false
});


function SideNav({ onClose }) {
  const menuList = [
    { id: 1, name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 2, name: 'Pemasukan', icon: HandCoins, path: '/dashboard/income' },
    { id: 3, name: 'Pengeluaran', icon: ShoppingCart , path: '/dashboard/budgets' },
    { id: 4, name: 'Tabungan', icon: PiggyBank, path: '/dashboard/savings' },
    { id: 5, name: 'AI Chatbot', icon: BotMessageSquare, path: '/dashboard/aiChatbot' }
  ];

  const path = usePathname();

  return (
    <div className="h-screen w-[250px] border-r bg-white p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-center">
          <Image src='/logo.png' alt='logo' width={160} height={100} />
        </div>
        <nav className="mt-6 space-y-2">
          {menuList.map((menu) => {
            const isActive = path === menu.path;
            return (
              <Link key={menu.id} href={menu.path} onClick={onClose}> {/* ✅ Tambahkan onClose */}
                <div
                  className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-[#2FB98D] to-[#127C71] text-white shadow'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-teal-700'
                    }`}
                >
                  <menu.icon className="w-5 h-5" />
                  <span>{menu.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
        <SafeUserButton />
        <span className="text-sm text-gray-700">Profil</span>
      </div>
    </div>
  );
}

export default SideNav;
