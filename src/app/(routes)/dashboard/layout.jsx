'use client'

import React, { useEffect, useState } from 'react'
import SideNav from './_components/SideNav'

import { db } from "../../../../utils/dbConfig";
import { Dana } from "../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

function DashboardLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    user && checkUserDana();
  }, [user]);

  const checkUserDana = async () => {
    const result = await db.select().from(Dana).where(eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress));
    if (result?.length === 0) {
      router.replace('/dashboard/budgets');
    }
  };

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="p-2 bg-white rounded-md shadow hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-teal-700" />
        </button>
      </div>

      {/* SideNav Desktop */}
      <div className="fixed md:w-64 hidden md:block h-full z-40">
        <SideNav />
      </div>

      {/* SideNav Mobile (Drawer) */}
      {isMobileNavOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileNavOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transition-all duration-300">
            <SideNav onClose={() => setIsMobileNavOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="md:ml-64">{children}</div>
    </div>
  );
}

export default DashboardLayout;
