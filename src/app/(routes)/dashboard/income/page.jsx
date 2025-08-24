'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import IncomeList from './_components/IncomeList'
import CreateIncome from './_components/CreateIncome'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function IncomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedMonth = Number(searchParams.get('month')) || new Date().getMonth() + 1
  const selectedYear = Number(searchParams.get('year')) || new Date().getFullYear()

  const [refreshKey, setRefreshKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

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
    <div className="px-4 md:px-10 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl">Daftar Pemasukan</h1>
          <p className="text-gray-600 mt-2">Yuk, catat dan lihat pemasukanmu bulan ini!</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

          <CreateIncome refreshData={refreshData} />
        </div>
      </div>

      <div className="mt-6">
        <IncomeList
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
          searchKeyword={searchTerm}
          key={refreshKey}
        />
      </div>
    </div>
  )
}
