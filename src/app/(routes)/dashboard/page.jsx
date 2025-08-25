"use client";

import React, { useEffect, useState, Suspense } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { db } from "utils/dbConfig";
import { desc, eq, and, sql } from "drizzle-orm";
import CardInfo from "./_components/CardInfo";
import BarChartDashboard from "./_components/BarChartDashboard";
import TransactionListTable from "./_components/TransactionListTable";
import {
  Dana,
  Pengeluaran,
  Pemasukan,
  Tabungan,
  RiwayatTabungan,
} from "utils/schema";
import BudgetItem from "./budgets/_components/BudgetItem";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";

// Membuat komponen utama yang dibungkus Suspense
function DashboardContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const monthParam = Number(searchParams.get("month"));
  const yearParam = Number(searchParams.get("year"));
  const selectedMonth = !isNaN(monthParam) ? monthParam : "";
  const selectedYear = !isNaN(yearParam) ? yearParam : "";
  const bulanFormatted =
    selectedYear && selectedMonth
      ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
      : null;

  const [budgetList, setBudgetList] = useState([]);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalMenabung, setTotalMenabung] = useState(0);
  const [transaksiList, setTransaksiList] = useState([]);
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    if (!selectedMonth || !selectedYear) {
      const now = dayjs();
      router.replace(`/dashboard?month=${now.month() + 1}&year=${now.year()}`);
    }
  }, [selectedMonth, selectedYear, router]);

  useEffect(() => {
    if (user && selectedMonth && selectedYear) {
      getDashboardData();
    }
  }, [user, selectedMonth, selectedYear]);

  async function getDashboardData() {
    await Promise.all([
      getBudgetList(),
      getTotalPemasukan(),
      getAllTransactions(),
      getTotalMenabung(),
    ]);
  }

  async function getBudgetList() {
    try {
      setLoadingBudget(true);
      const budgets = await db
        .select({
          ...Dana,
          totalSpend: sql`SUM(${Pengeluaran.jumlah})`.mapWith(Number),
          TotalItem: sql`COUNT(${Pengeluaran.id})`.mapWith(Number),
        })
        .from(Dana)
        .leftJoin(Pengeluaran, eq(Dana.id, Pengeluaran.danaId))
        .where(
          and(
            eq(Dana.createdBy, user.primaryEmailAddress?.emailAddress),
            eq(Dana.bulan, bulanFormatted)
          )
        )
        .groupBy(Dana.id)
        .orderBy(desc(Dana.id));
      setBudgetList(budgets);
    } catch (error) {
      console.error("Gagal ambil budget:", error);
      setBudgetList([]);
    } finally {
      setLoadingBudget(false);
    }
  }

  async function getTotalPemasukan() {
    try {
      const pemasukan = await db
        .select()
        .from(Pemasukan)
        .where(
          and(
            eq(Pemasukan.createdBy, user.primaryEmailAddress?.emailAddress),
            sql`EXTRACT(YEAR FROM ${Pemasukan.tanggal}) = ${selectedYear}`,
            sql`EXTRACT(MONTH FROM ${Pemasukan.tanggal}) = ${selectedMonth}`
          )
        );
      const total = pemasukan.reduce(
        (acc, item) => acc + Number(item.jumlah),
        0
      );
      setTotalPemasukan(total);
    } catch (error) {
      console.error("Gagal ambil pemasukan:", error);
      setTotalPemasukan(0);
    }
  }

  async function getTotalMenabung() {
    try {
      const total = await db
        .select({
          nominal: sql`SUM(${RiwayatTabungan.nominal})`.mapWith(Number),
        })
        .from(RiwayatTabungan)
        .leftJoin(Tabungan, eq(RiwayatTabungan.tabunganId, Tabungan.id))
        .where(
          and(
            eq(Tabungan.createdBy, user.primaryEmailAddress?.emailAddress),
            sql`EXTRACT(YEAR FROM ${RiwayatTabungan.tanggal}) = ${selectedYear}`,
            sql`EXTRACT(MONTH FROM ${RiwayatTabungan.tanggal}) = ${selectedMonth}`
          )
        );

      setTotalMenabung(total?.[0]?.nominal || 0);
    } catch (error) {
      console.error("Gagal ambil total menabung:", error);
      setTotalMenabung(0);
    }
  }

  async function getAllTransactions() {
    if (!user || !user.primaryEmailAddress?.emailAddress) return;

    try {
      const [pengeluaran, pemasukan, nabung] = await Promise.all([
        db
          .select({
            rawId: Pengeluaran.id,
            tanggal: Pengeluaran.createdAt,
            jumlah: Pengeluaran.jumlah,
            tipe: sql`'Pengeluaran'`.mapWith(String),
          })
          .from(Dana)
          .rightJoin(Pengeluaran, eq(Dana.id, Pengeluaran.danaId))
          .where(
            and(
              eq(Dana.createdBy, user.primaryEmailAddress.emailAddress),
              eq(
                Dana.bulan,
                `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
              )
            )
          ),

        db
          .select({
            rawId: Pemasukan.id,
            tanggal: Pemasukan.tanggal,
            jumlah: Pemasukan.jumlah,
            tipe: sql`'Pemasukan'`.mapWith(String),
          })
          .from(Pemasukan)
          .where(
            and(
              eq(Pemasukan.createdBy, user.primaryEmailAddress.emailAddress),
              sql`EXTRACT(YEAR FROM ${Pemasukan.tanggal}) = ${selectedYear}`,
              sql`EXTRACT(MONTH FROM ${Pemasukan.tanggal}) = ${selectedMonth}`
            )
          ),

        db
          .select({
            rawId: RiwayatTabungan.id,
            tanggal: RiwayatTabungan.tanggal,
            jumlah: RiwayatTabungan.nominal,
            tipe: sql`'Tabungan'`.mapWith(String),
          })
          .from(RiwayatTabungan)
          .leftJoin(Tabungan, eq(RiwayatTabungan.tabunganId, Tabungan.id))
          .where(
            and(
              eq(Tabungan.createdBy, user.primaryEmailAddress.emailAddress),
              sql`EXTRACT(YEAR FROM ${RiwayatTabungan.tanggal}) = ${selectedYear}`,
              sql`EXTRACT(MONTH FROM ${RiwayatTabungan.tanggal}) = ${selectedMonth}`
            )
          ),
      ]);

      const combined = [...pengeluaran, ...pemasukan, ...nabung].filter(
        (item) => item && item.tanggal && item.jumlah
      );
      const sorted = combined.sort(
        (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
      );
      setTransaksiList(sorted);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
      setTransaksiList([]);
    }
  }

  const handleMonthChange = (e) => {
    router.push(`/dashboard?month=${e.target.value}&year=${selectedYear}`);
  };

  const handleYearChange = (e) => {
    router.push(`/dashboard?month=${selectedMonth}&year=${e.target.value}`);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-3xl sm:text-4xl capitalize">
            Hi, {user?.fullName} 👋🏻
          </h2>
          <p className="text-gray-600 mt-2">
            Ini dia ringkasan keuanganmu. Yuk, cek dan kelola!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border border-teal-500 px-3 py-2 rounded-lg bg-white text-gray-700 focus:ring-1 focus:ring-[#2FB98D] focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {dayjs().month(i).format("MMMM")}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="border border-teal-500 px-3 py-2 rounded-lg bg-white text-gray-700 focus:ring-1 focus:ring-[#2FB98D] focus:outline-none"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              router.push(
                `/dashboard/budgets?month=${selectedMonth}&year=${selectedYear}`
              )
            }
            className="bg-gradient-to-br from-[#2FB98D] to-[#127C71] text-white px-4 py-2 rounded-md shadow hover:scale-105 transition"
          >
            + Buat Budgeting Bulan Ini
          </button>
        </div>
      </div>

      <CardInfo
        budgetList={budgetList}
        totalPemasukan={totalPemasukan}
        totalMenabung={totalMenabung}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-5">
        <div className="md:col-span-2">
          <BarChartDashboard budgetList={budgetList} />
          <div className="overflow-y-auto max-h-[500px] pr-2">
            <TransactionListTable
              transaksiList={transaksiList}
              refreshData={getDashboardData}
            />
          </div>
        </div>

        <div className="grid">
          <h2 className="font-bold text-lg mb-3">Kategori Pengeluaran</h2>
          <div className="flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-1">
            {budgetList.length === 0
              ? [1, 2, 3, 4].map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 rounded-full w-10 h-10" />
                        <div>
                          <h4 className="font-semibold text-gray-700">
                            Kategori
                          </h4>
                          <p className="text-sm text-gray-500">0 Item</p>
                        </div>
                      </div>
                      <div className="font-bold text-gray-700">Rp 0</div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Pengeluaran Rp 0</span>
                      <span>Tersisa Rp 0</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 bg-teal-400 rounded-full w-[0%]" />
                    </div>
                  </div>
                ))
              : budgetList.map((budget, i) => (
                  <BudgetItem
                    key={i}
                    budget={budget}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen utama dengan Suspense boundary
function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

export default Dashboard;
