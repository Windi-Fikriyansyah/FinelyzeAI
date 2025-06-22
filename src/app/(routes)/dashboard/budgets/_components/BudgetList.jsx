"use client"
import React, { useEffect, useState } from 'react'
import CreateBudget from './CreateBudget'
import BudgetItem from './BudgetItem'
import { db } from 'utils/dbConfig'
import { desc, eq, getTableColumns, sql, and, like } from 'drizzle-orm'
import { Dana, Pengeluaran } from 'utils/schema'
import { useUser } from '@clerk/nextjs'
import { formatRupiah } from 'utils/formatter'

function BudgetList({ defaultMonth, defaultYear }) {
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
        ) : budgetList.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 animate-pulse">
            <p className="text-lg font-semibold">Belum ada dana keuangan bulan ini 🗓️</p>
            <p className="text-sm">Silakan klik tombol + untuk menambahkan dana baru.</p>
          </div>
        ) : (
          budgetList.map((budget, index) => (
            <BudgetItem budget={budget} key={index} />
          ))
        )}
      </div>
    </div>
  )
}

export default BudgetList
