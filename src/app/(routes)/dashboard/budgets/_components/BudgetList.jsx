"use client"
import React, { useEffect, useState } from 'react'
import BudgetItem from './BudgetItem'
import { db } from 'utils/dbConfig'
import { desc, eq, getTableColumns, sql, and, like } from 'drizzle-orm'
import { Dana, Pengeluaran } from 'utils/schema'
import { useUser } from '@clerk/nextjs'
import { ShoppingCart } from 'lucide-react'

function BudgetList({ defaultMonth, defaultYear, searchKeyword }) {
  const [budgetList, setBudgetList] = useState(null)
  const { user } = useUser()

  useEffect(() => {
    user && getBudgetList()
  }, [user, defaultMonth, defaultYear])

  const getBudgetList = async () => {
    const result = await db
      .select({
        ...getTableColumns(Dana),
        totalSpend: sql`sum(${Pengeluaran.jumlah})`.mapWith(Number),
        TotalItem: sql`count(${Pengeluaran.id})`.mapWith(Number),
      })
      .from(Dana)
      .leftJoin(Pengeluaran, eq(Dana.id, Pengeluaran.danaId))
      .where(
        and(
          eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress),
          like(Dana.bulan, `${defaultYear}-${String(defaultMonth).padStart(2, '0')}%`)
        )
      )
      .groupBy(Dana.id)
      .orderBy(desc(Dana.id))

    setBudgetList(result)
  }

  const filteredList = budgetList
    ?.filter(item => item.nama.toLowerCase() !== "tabungan")
    .filter(item => item.nama.toLowerCase().includes(searchKeyword?.toLowerCase() || ''))

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetList === null ? (
          [...Array(5)].map((_, index) => (
            <div
              key={index}
              className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse"
            ></div>
          ))
        ) : filteredList.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500 border border-dashed border-teal-300 rounded-xl bg-gradient-to-br from-[#f0faf7] to-white shadow-sm">
            <ShoppingCart className="w-10 h-10 text-teal-500 mb-3" />
            <p className="text-lg font-semibold text-gray-600 mb-1">Kategori tidak ditemukan</p>
            <p className="text-sm">
              Coba gunakan keyword lain atau tambah kategori baru.
            </p>
          </div>
        ) : (
          filteredList.map((budget, index) => (
            <BudgetItem budget={budget} key={index} />
          ))
        )}
      </div>
    </div>
  )
}

export default BudgetList
