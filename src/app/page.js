"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Fitur from "./_components/Features";
import FAQ from "./_components/FAQ";
import Footer from "./_components/Footer";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn]);

  return (
    <div>
      <Header />
      <Hero />
      <Fitur />  
      <FAQ />    
      <Footer /> 
    </div>
  );
}
