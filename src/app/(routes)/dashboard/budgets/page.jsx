'use client'
import React from 'react'
import BudgetList from './_components/BudgetList'
import { useSearchParams } from 'next/navigation'

function Budget() {
  const searchParams = useSearchParams();
  const selectedMonth = Number(searchParams.get('month')) || new Date().getMonth() + 1;
  const selectedYear = Number(searchParams.get('year')) || new Date().getFullYear();

  return (
    <div className='p-10'>
      <h2 className='font-bold text-3xl'>Kategori Dana</h2>
      <p className="text-gray-600 mb-5">Buat kategori dana sesuai kebutuhanmu. Yuk, mulai atur sekarang!</p>

      <BudgetList
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />
      
    </div>
  )
}

export default Budget
