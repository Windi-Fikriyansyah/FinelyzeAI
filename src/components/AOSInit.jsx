'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-in-out',
    });
  }, []);

  return null;
}
