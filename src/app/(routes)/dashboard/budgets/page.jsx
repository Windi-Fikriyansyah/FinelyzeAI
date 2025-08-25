"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BudgetList from "./_components/BudgetList";
import CreateBudget from "./_components/CreateBudget";
import ExpenseHistory from "./ExpenseHistory";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Loading component for Suspense
function LoadingBudgets() {
  return (
    <div className="p-10">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="flex gap-3 mb-6">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Main Budget Component
function BudgetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this only runs on client side
    setIsClient(true);

    const defaultMonth =
      Number(searchParams.get("month")) || new Date().getMonth() + 1;
    const defaultYear =
      Number(searchParams.get("year")) || new Date().getFullYear();

    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
  }, [searchParams]);

  const handleMonthChange = (e) => {
    if (!isClient) return;

    const newMonth = Number(e.target.value);
    if (selectedYear) {
      router.push(`/dashboard/budgets?month=${newMonth}&year=${selectedYear}`);
    }
  };

  const handleYearChange = (e) => {
    if (!isClient) return;

    const newYear = Number(e.target.value);
    if (selectedMonth) {
      router.push(`/dashboard/budgets?month=${selectedMonth}&year=${newYear}`);
    }
  };

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Don't render until client-side hydration is complete
  if (!isClient || !selectedMonth || !selectedYear) {
    return <LoadingBudgets />;
  }

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-bold text-3xl">Kategori Pengeluaran</h2>
          <p className="text-gray-600 mt-2">
            Yuk! alokasikan dana per kategori, agar pengeluaranmu lebih
            terencana dan mudah dipantau.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search . . ."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3"
            />
          </div>

          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border border-emerald-500 px-3 py-2 rounded-lg bg-white text-gray-700 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
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
            className="border border-emerald-500 px-3 py-2 rounded-lg bg-white text-gray-700 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <CreateBudget refreshData={refreshData} />
        </div>
      </div>

      <BudgetList
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
        searchKeyword={searchTerm}
        key={refreshKey}
      />

      <ExpenseHistory
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        searchKeyword={searchTerm}
        refreshData={refreshData}
      />
    </div>
  );
}

// Export dengan Suspense wrapper
export default function Budget() {
  return (
    <Suspense fallback={<LoadingBudgets />}>
      <BudgetContent />
    </Suspense>
  );
}
