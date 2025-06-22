"use client";

import React, { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { db } from "utils/dbConfig";
import { desc, eq, and, sql, lt } from "drizzle-orm";
import CardInfo from "./_components/CardInfo";
import BarChartDashboard from "./_components/BarChartDashboard";
import { Dana, Pengeluaran, Pemasukan, Tabungan } from "utils/schema";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";

function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const monthParam = Number(searchParams.get("month"));
  const yearParam = Number(searchParams.get("year"));
  // Ganti null dengan "" agar controlled component tidak error
  const selectedMonth = !isNaN(monthParam) ? monthParam : "";
  const selectedYear = !isNaN(yearParam) ? yearParam : "";
  const bulanFormatted = selectedYear && selectedMonth ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}` : null;

  const [budgetList, setBudgetList] = useState([]);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [expensesList, setExpensesList] = useState([]);
  const [totalSavingsGoals, setTotalSavingsGoals] = useState(0);
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
      getAllExpenses(),
      getTotalSavingsGoals(),
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
      console.error("Gagal ambil budget dari DB:", error);
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

      const total = pemasukan.reduce((acc, item) => acc + Number(item.jumlah), 0);
      setTotalPemasukan(total);
    } catch (error) {
      console.error("Gagal ambil pemasukan dari DB:", error);
      setTotalPemasukan(0);
    }
  }

  async function getAllExpenses() {
    try {
      const result = await db
        .select({
          id: Pengeluaran.id,
          nama: Pengeluaran.nama,
          jumlah: Pengeluaran.jumlah,
          createdAt: Pengeluaran.createdAt,
          danaNama: Dana.nama,
        })
        .from(Dana)
        .rightJoin(Pengeluaran, eq(Dana.id, Pengeluaran.danaId))
        .where(
          and(
            eq(Dana.createdBy, user.primaryEmailAddress?.emailAddress),
            eq(Dana.bulan, bulanFormatted)
          )
        )
        .orderBy(desc(Pengeluaran.id));
      setExpensesList(result);
    } catch (error) {
      console.error("Gagal ambil pengeluaran dari DB:", error);
      setExpensesList([]);
    }
  }

  async function getTotalSavingsGoals() {
    try {
      const goals = await db
        .select()
        .from(Tabungan)
        .where(
          and(
            eq(Tabungan.createdBy, user.primaryEmailAddress?.emailAddress),
            lt(Tabungan.terkumpul, Tabungan.target)
          )
        );
      setTotalSavingsGoals(goals.length);
    } catch (error) {
      console.error("Gagal ambil data tabungan:", error);
      setTotalSavingsGoals(0);
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-bold text-3xl sm:text-4xl capitalize">
            Hi, {user?.fullName} 👋🏻
          </h2>
          <p className="text-gray-600">Ini dia ringkasan keuanganmu. Yuk, cek dan kelola!</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <UserButton />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
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

        {!loadingBudget && budgetList.length === 0 && (
          <button
            className="px-4 py-2 rounded text-white bg-gradient-to-tr from-[#2FB98D] via-[#1AAE94] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-300 ease-in-out"
            onClick={() => router.push(`/dashboard/budgets?month=${selectedMonth}&year=${selectedYear}`)}
          >
            + Buat Budgeting Bulan Ini
          </button>
        )}
      </div>

      {/* Card Info */}
      <CardInfo
        budgetList={budgetList}
        totalPemasukan={totalPemasukan}
        totalSavingsGoals={totalSavingsGoals}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-5">
        <div className="md:col-span-2">
          <BarChartDashboard budgetList={budgetList} />
          <div className="overflow-y-auto max-h-[500px] pr-2">
            <ExpenseListTable expensesList={expensesList} refreshData={getDashboardData} />
          </div>
        </div>

        {/* Sidebar Kategori Pengeluaran */}
        <div className="grid">
          <h2 className="font-bold text-lg mb-3">Kategori Pengeluaran</h2>

          <div className="flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-1">
            {budgetList.length === 0 ? (
              [1, 2, 3, 4].map((_, i) => (
                <div key={i} className="border rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-200 rounded-full w-10 h-10" />
                      <div>
                        <h4 className="font-semibold text-gray-700">Kategori</h4>
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
            ) : (
              budgetList.map((budget, i) => (
                <BudgetItem
                  key={i}
                  budget={budget}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
