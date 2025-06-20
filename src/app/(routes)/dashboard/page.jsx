"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { db } from 'utils/dbConfig';
import { desc, eq, getTableColumns, sql, and } from 'drizzle-orm';
import CardInfo from './_components/CardInfo';
import BarChartDashboard from './_components/BarChartDashboard';
import { Dana, Pengeluaran } from 'utils/schema';
import BudgetItem from './budgets/_components/BudgetItem';
import ExpenseListTable from './expenses/_components/ExpenseListTable';
import dayjs from "dayjs";
import { useRouter, useSearchParams } from 'next/navigation';

function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);

  // Ambil bulan & tahun dari URL
  const monthParam = Number(searchParams.get("month"));
  const yearParam = Number(searchParams.get("year"));
  const selectedMonth = !isNaN(monthParam) ? monthParam : null;
  const selectedYear = !isNaN(yearParam) ? yearParam : null;
  const bulanFormatted = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Redirect jika param tidak ada
  useEffect(() => {
    if (!selectedMonth || !selectedYear) {
      const now = dayjs();
      router.replace(`/dashboard?month=${now.month() + 1}&year=${now.year()}`);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (user && selectedMonth && selectedYear) {
      getDashboardData();
    }
  }, [user, selectedMonth, selectedYear]);

  const getDashboardData = async () => {
    await getBudgetList();
    await getAllExpenses();
  };

  const getBudgetList = async () => {
    const result = await db.select({
      ...getTableColumns(Dana),
      totalSpend: sql`sum(${Pengeluaran.jumlah})`.mapWith(Number),
      TotalItem: sql`count(${Pengeluaran.id})`.mapWith(Number),
    })
      .from(Dana)
      .leftJoin(Pengeluaran, eq(Dana.id, Pengeluaran.danaId))
      .where(
        and(
          eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress),
          eq(Dana.bulan, bulanFormatted)
        )
      )
      .groupBy(Dana.id)
      .orderBy(desc(Dana.id));

    setBudgetList(result);
  };

  const getAllExpenses = async () => {
    const result = await db.select({
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
          eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress),
          eq(Dana.bulan, bulanFormatted)
        )
      )
      .orderBy(desc(Pengeluaran.id));

    setExpensesList(result);
  };

  // Jika param belum siap, jangan render
  if (!selectedMonth || !selectedYear) return null;

  const handleMonthChange = (e) => {
    router.push(`/dashboard?month=${e.target.value}&year=${selectedYear}`);
  };

  const handleYearChange = (e) => {
    router.push(`/dashboard?month=${selectedMonth}&year=${e.target.value}`);
  };

  return (
    <div className='p-8'>
      <h2 className="font-bold text-4xl capitalize">Hi, {user?.fullName} 👋🏻</h2>
      <p className="text-gray-600">Ini dia ringkasan keuanganmu. Yuk, cek dan kelola!</p>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="border px-3 py-2 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{dayjs().month(i).format("MMMM")}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="border px-3 py-2 rounded"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {budgetList?.length === 0 && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => {
              router.push(`/dashboard/budgets?month=${selectedMonth}&year=${selectedYear}`);
            }}
          >
            + Buat Budgeting Bulan Ini
          </button>
        )}
      </div>

      <CardInfo budgetList={budgetList} />

      <div className='grid grid-cols-1 md:grid-cols-3 mt-6 gap-5'>
        <div className='md:col-span-2'>
          <BarChartDashboard budgetList={budgetList} />
          <div className="overflow-y-auto max-h-[500px] pr-2">
            <ExpenseListTable
              expensesList={expensesList}
              refreshData={getDashboardData}
            />
          </div>
        </div>

        <div className='grid gap-5'>
          <h2 className='font-bold text-lg'>Kategori Dana</h2>
          {budgetList.length === 0 ? (
            [1, 2, 3, 4].map((_, index) => (
              <div key={index} className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
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
                  <div className="h-2 bg-blue-400 rounded-full w-[0%]" />
                </div>
              </div>
            ))
          ) : (
            budgetList.map((budget, index) => (
              <BudgetItem
                budget={budget}
                key={index}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
