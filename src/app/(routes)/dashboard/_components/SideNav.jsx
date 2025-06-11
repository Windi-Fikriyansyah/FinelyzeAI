'use client';

import React, { useEffect } from 'react';
import Image from "next/image";
import Link from "next/link"; 
import { LayoutGrid, PiggyBank, ReceiptText, ShieldCheck } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

function SideNav() {
  const menuList = [
    {
      id: 1,
      name: 'Beranda',
      icon: LayoutGrid,
      path: '/dashboard'
    },
    {
      id: 2,
      name: 'Dana',
      icon: PiggyBank,
      path: '/dashboard/budgets'
    },
    {
      id: 3,
      name: 'Pengeluaran',
      icon: ReceiptText,
      path: '/dashboard/expenses'
    },
    {
      id: 4,
      name: 'AI Chatbot',
      icon: ShieldCheck,
      path: '/dashboard/aiChatbot'
    }
  ];

  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, [path]);

  return (
    <div className='h-screen p-5 border shadow-sm'>
      <Image 
        src='/logo.svg'
        alt='logo'
        width={160}
        height={100}
      />
      <div className='mt-5'>
        {menuList.map((menu) => (
          <Link key={menu.id} href={menu.path}>
            <h2 className={`flex gap-2 items-center
              text-gray-500 font-medium mb-2
              p-5 cursor-pointer rounded-md
              hover:text-primary hover:bg-blue-100
              ${path === menu.path ? 'text-primary bg-blue-100' : ''}
            `}>
              <menu.icon />
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>

      <div className='fixed bottom-10 p-5 flex gap-2 items-center'>
        <UserButton />
        <span>Profile</span>
      </div>
    </div>
  );
}

export default SideNav;
