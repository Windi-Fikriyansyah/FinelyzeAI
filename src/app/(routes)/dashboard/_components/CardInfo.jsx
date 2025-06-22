"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HandCoins,
  PiggyBank,
  Sparkles,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "utils/formatter";
import getFinancialAdvice from "utils/getFinancialAdvice";
import { Typewriter } from 'react-simple-typewriter';

function CardInfo({ budgetList = [], totalPemasukan = 0, totalSavingsGoals = 0 }) {
  const router = useRouter();
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [advice, setAdvice] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (advice) setTypingDone(false);
  }, [advice]);

  useEffect(() => {
    const totalBudget_ = budgetList.reduce(
      (acc, item) => acc + Number(item.jumlah || 0),
      0
    );
    const totalSpend_ = budgetList.reduce(
      (acc, item) => acc + Number(item.totalSpend || 0),
      0
    );

    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);

    if (budgetList.length > 0 && totalPemasukan > 0) {
      const kategoriList = budgetList.map(item => ({
        nama: item.nama,
        total: item.totalSpend,
      }));
      fetchAdvice(totalBudget_, totalSpend_, totalPemasukan, kategoriList);
    } else {
      setAdvice("");
    }
  }, [budgetList, totalPemasukan]);

  const fetchAdvice = async (dana, pengeluaran, pemasukan, kategoriList) => {
    setTypingDone(false);
    setLoadingAdvice(true);
    try {
      const result = await getFinancialAdvice(dana, pengeluaran, pemasukan, kategoriList);
      setAdvice(result || "Tidak ada saran tersedia");
    } catch (err) {
      setAdvice("Gagal mengambil saran dari AI 😓");
      console.error("Error fetchAdvice:", err);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <>
      {/* Saran dari AI */}
      <div className="p-6 rounded-2xl mt-4 bg-gradient-to-br from-[#FFFBE6] to-white border border-[#F9D84A]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-[#FFE66D] via-[#F9D84A] to-[#e4bb14] text-white shadow-md animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-1">Finelyze AI</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {loadingAdvice ? (
                <span className="text-orange-600">💡 Menganalisis keuanganmu...</span>
              ) : budgetList.length === 0 ? (
                "💡 Belum ada budgeting bulan ini."
              ) : advice && !typingDone ? (
                <span className="text-gray-800">
                  <Typewriter
                    words={[advice]}
                    typeSpeed={40}
                    delaySpeed={1000}
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

      {/* Kartu Ringkasan */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Total Pemasukan */}
        <div
          onClick={() => router.push("/dashboard/income")}
          className="cursor-pointer p-7 border rounded-lg flex items-center justify-between shadow-sm hover:shadow-lg transition"
          title="Klik untuk melihat atau menambahkan pemasukan"
        >
          <div>
            <h2 className="text-sm text-gray-600">Total Pemasukan</h2>
            <h2 className="font-bold text-2xl text-gray-900">
              {formatRupiah(totalPemasukan)}
            </h2>
          </div>
          <HandCoins className="bg-gradient-to-t from-[#2FB98D] to-[#127C71] p-3 h-12 w-12 rounded-full text-white" />
        </div>

        {/* 2. Total Pengeluaran */}
        <div
          onClick={() => router.push("/dashboard/budgets")}
          className="cursor-pointer p-7 border rounded-lg flex items-center justify-between shadow-sm hover:shadow-lg transition"
          title="Klik untuk melihat atau mengelola pengeluaran"
        >
          <div>
            <h2 className="text-sm text-gray-600">Total Pengeluaran</h2>
            <h2 className="font-bold text-2xl text-gray-900">
              {formatRupiah(totalSpend)}
            </h2>
          </div>
          <Wallet className="bg-gradient-to-t from-[#2FB98D] to-[#127C71] p-3 h-12 w-12 rounded-full text-white" />
        </div>

        {/* 3. Goals Tabungan */}
        <div
          onClick={() => router.push("/dashboard/savings")}
          className="cursor-pointer p-7 border rounded-lg flex items-center justify-between shadow-sm hover:shadow-lg transition"
          title="Klik untuk kelola tabungan yang sedang kamu bangun"
        >
          <div>
            <h2 className="text-sm text-gray-600">Target Tabungan</h2>
            <h2 className="font-bold text-2xl text-gray-900">
              {totalSavingsGoals}
            </h2>
          </div>
          <PiggyBank className="bg-gradient-to-t from-[#2FB98D] to-[#127C71] p-3 h-12 w-12 rounded-full text-white" />
        </div>
      </div>
    </>
  );
}

export default CardInfo;
