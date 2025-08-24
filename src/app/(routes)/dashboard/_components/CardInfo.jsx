"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HandCoins,
  PiggyBank,
  Sparkles,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import { formatRupiah } from "utils/formatter";
import getFinancialAdvice from "utils/getFinancialAdvice";
import dynamic from "next/dynamic";

const Typewriter = dynamic(
  () => import("react-simple-typewriter").then((mod) => mod.Typewriter),
  { ssr: false }
);

function CardInfo({ budgetList = [], totalPemasukan = 0, totalMenabung = 0 }) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalBudget = budgetList.reduce(
    (acc, item) => acc + Number(item.jumlah || 0),
    0
  );
  const totalSpend = budgetList.reduce(
    (acc, item) => acc + Number(item.totalSpend || 0),
    0
  );

  const [advice, setAdvice] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [typingDone, setTypingDone] = useState(false);

  const fetchAdvice = async () => {
    if (budgetList.length === 0 || totalPemasukan === 0) {
      setAdvice("💡 Belum ada data keuangan bulan ini.");
      return;
    }

    setLoadingAdvice(true);
    setTypingDone(false);

    const kategoriList = budgetList.map((item) => ({
      nama: item.nama,
      total: item.totalSpend,
    }));

    try {
      const result = await getFinancialAdvice(
        totalBudget,
        totalSpend,
        totalPemasukan,
        kategoriList
      );
      setAdvice(result || "Tidak ada saran tersedia");
    } catch (err) {
      setAdvice("Gagal mengambil saran dari AI 😓");
      console.error("Error fetchAdvice:", err);
    } finally {
      setLoadingAdvice(false);
    }
  };

  if (!mounted) return null; 

  return (
    <>
      <div className="p-6 rounded-2xl mt-4 bg-gradient-to-br from-[#FFFBE6] to-white border border-[#F9D84A]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-[#FFE66D] via-[#F9D84A] to-[#e4bb14] text-white shadow-md animate-pulse">
            <Sparkles className="text-black w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold mb-1">Finelyze AI</h2>
              <button
                className="text-sm flex items-center gap-1 text-gray-700 hover:text-black"
                onClick={fetchAdvice}
              >
                <RefreshCw className="w-4 h-4" />
                Generate Saran
              </button>
            </div>

            {(!advice && !loadingAdvice) && (
              <p className="text-sm text-gray-600 mb-2 italic">
                Saran keuangan otomatis
              </p>
            )}

            <p className="text-sm text-gray-700 leading-relaxed mt-1">
              {loadingAdvice ? (
                <span className="text-orange-600">💡 Menganalisis keuanganmu...</span>
              ) : advice && !typingDone ? (
                <span className="text-gray-800">
                  <Typewriter
                    words={[advice]}
                    typeSpeed={40}
                    delaySpeed={500}
                    cursor
                    cursorStyle="|"
                    onTypeDone={() => setTypingDone(true)}
                  />
                </span>
              ) : (
                <span className="text-gray-800">{advice}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          onClick={() => router.push("/dashboard/income")}
          className="cursor-pointer p-7 border rounded-lg flex items-center justify-between shadow-sm hover:shadow-lg transition"
          title="Klik untuk melihat atau menambahkan pemasukan"
        >
          <div>
            <h2 className="text-sm font-medium text-green-700">Total Pemasukan</h2>
            <h2 className="font-bold text-2xl text-gray-900">
              Rp {formatRupiah(totalPemasukan)}
            </h2>
          </div>
          <HandCoins className="bg-gradient-to-t from-[#2FB98D] to-[#127C71] p-3 h-12 w-12 rounded-full text-white" />
        </div>

        <div
          onClick={() => router.push("/dashboard/budgets")}
          className="cursor-pointer p-7 border rounded-lg flex items-center justify-between shadow-sm hover:shadow-lg transition"
          title="Klik untuk melihat atau mengelola pengeluaran"
        >
          <div>
            <h2 className="text-sm font-medium text-red-500">Total Pengeluaran</h2>
            <h2 className="font-bold text-2xl text-gray-900">
              Rp {formatRupiah(totalSpend)}
            </h2>
          </div>
          <ShoppingCart className="bg-gradient-to-t from-[#2FB98D] to-[#127C71] p-3 h-12 w-12 rounded-full text-white" />
        </div>

        <div
          onClick={() => router.push("/dashboard/savings")}
          className="cursor-pointer p-7 border rounded-lg flex items-center justify-between shadow-sm hover:shadow-lg transition"
          title="Klik untuk melihat total menabung bulan ini"
        >
          <div>
            <h2 className="text-sm font-medium text-blue-700">Total Menabung</h2>
            <h2 className="font-bold text-2xl text-gray-900">
              Rp {formatRupiah(totalMenabung)}
            </h2>
          </div>
          <PiggyBank className="bg-gradient-to-t from-[#2FB98D] to-[#127C71] p-3 h-12 w-12 rounded-full text-white" />
        </div>
      </div>
    </>
  );
}

export default CardInfo;
