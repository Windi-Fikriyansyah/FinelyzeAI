'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SideNav from './SideNav';

export default function SideNavWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6 text-teal-700" /> : <Menu className="w-6 h-6 text-teal-700" />}
        </button>
      </div>

      {isMobile ? (
        <div className={`fixed top-0 left-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SideNav onClose={() => setIsOpen(false)} />
        </div>
      ) : (
        isOpen && <SideNav />
      )}

      <div className={`flex-1 transition-all duration-300 ${isOpen && !isMobile ? 'ml-[250px]' : 'ml-0'}`}>
        {children}
      </div>
    </div>
  );
}
