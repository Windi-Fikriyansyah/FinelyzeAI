import Link from 'next/link'
import React from 'react'
import { formatRupiah } from 'utils/formatter'

function BudgetItem({ budget, selectedMonth, selectedYear }) {
  if (!budget || !budget.nama) return null;   

  const isOverBudget = budget.totalSpend > budget.jumlah;

  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.jumlah) * 100;
    return Math.min(perc, 100).toFixed(2);
  };

  const expenseLink = `/dashboard/expenses/${budget?.id}?month=${selectedMonth}&year=${selectedYear}`;

  return (
    <Link href={expenseLink}>
      <div className='p-5 border rounded-lg bg-gradient-to-br from-[#E6FAF3] to-white border border-teal-200 shadow-sm hover:shadow-md cursor-pointer h-[170px]'>
        <div className='flex gap-2 items-center justify-between'>
          <div className='flex gap-2 items-center'>
            <h2 className='w-12 h-12 flex items-center justify-center text-2xl bg-gradient-to-t from-[#b8fae5] via-[#6ce1cb] to-[#17b4a5] rounded-full'>
              {budget?.icon}
            </h2>
            <div> 
              <h2 className='font-bold'>{budget.nama}</h2>
              <h2 className='text-sm text-gray-500'>{budget.TotalItem} Item</h2>
            </div>
          </div>
          <h2 className='font-bold text-primary text-lg'>
            Rp {formatRupiah(budget.jumlah)}
          </h2>
        </div>

        <div className='mt-5'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-xs text-slate-400'>
              Pengeluaran Rp {formatRupiah(budget.totalSpend || 0)}
            </h2>
            <h2 className={`text-xs flex items-center gap-1 ${isOverBudget ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
              {isOverBudget ? (
                <>
                  <span title="Pengeluaran melebihi dana">⚠️</span>
                  Over Budget Rp {formatRupiah(budget.totalSpend - budget.jumlah)}
                </>
              ) : (
                <>
                  Tersisa Rp {formatRupiah(budget.jumlah - budget.totalSpend)}
                </>
              )}
            </h2>
          </div>
          <div className='w-full bg-slate-300 h-2 rounded-full'>
            <div className='bg-primary h-2 rounded-full' style={{ width: `${calculateProgressPerc()}%` }} />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default BudgetItem
