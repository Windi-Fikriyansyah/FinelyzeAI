'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import IncomeList from './_components/IncomeList'
import CreateIncome from './_components/CreateIncome'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export default function IncomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedMonth = Number(searchParams.get('month')) || new Date().getMonth() + 1
  const selectedYear = Number(searchParams.get('year')) || new Date().getFullYear()

  const [refreshKey, setRefreshKey] = useState(0)

  const handleMonthChange = (e) => {
    router.push(`/dashboard/income?month=${e.target.value}&year=${selectedYear}`)
  }

  const handleYearChange = (e) => {
    router.push(`/dashboard/income?month=${selectedMonth}&year=${e.target.value}`)
  }

  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="p-10">
      <h1 className="font-bold text-3xl">Daftar Pemasukan</h1>
      <p className="text-gray-600 mb-5">Lihat dan kelola pemasukanmu bulan ini</p>

      {/* Dropdown Bulan & Tahun */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
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

        <CreateIncome refreshData={refreshData} />
      </div>

      {/* List Pemasukan */}
      <div className="mt-6">
        <IncomeList
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
          key={refreshKey} // trigger re-render saat refreshKey berubah
        />
      </div>
    </div>
  )
}
