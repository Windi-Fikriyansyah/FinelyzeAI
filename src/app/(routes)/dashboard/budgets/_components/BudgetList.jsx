"use client"
import React, { useEffect, useState } from 'react'
import CreateBudget from './CreateBudget'
import BudgetItem from './BudgetItem'
import { db } from '../../../../../../utils/dbConfig'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { Dana, Pengeluaran } from '../../../../../../utils/schema'
import { useUser } from '@clerk/nextjs'
import { formatRupiah } from 'utils/formatter';
import { and, like } from 'drizzle-orm';

const monthList = [
  { value: 1, name: 'Januari' },
  { value: 2, name: 'Februari' },
  { value: 3, name: 'Maret' },
  { value: 4, name: 'April' },
  { value: 5, name: 'Mei' },
  { value: 6, name: 'Juni' },
  { value: 7, name: 'Juli' },
  { value: 8, name: 'Agustus' },
  { value: 9, name: 'September' },
  { value: 10, name: 'Oktober' },
  { value: 11, name: 'November' },
  { value: 12, name: 'Desember' },
];

const currentYear = new Date().getFullYear();
const startYear = 2025;
const endYear = Math.max(currentYear + 5, startYear + 5);

function BudgetList() {

  const [budgetList, setBudgetList] = useState(null);
  const {user}=useUser();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    user && getBudgetList();
  }, [user, selectedMonth, selectedYear]);
  
  /**
   * untuk mendapatkan Budget List
   */
  const getBudgetList=async()=>{

    const result=await db.select({
      ...getTableColumns(Dana),
      totalSpend:sql `sum(${Pengeluaran.jumlah})`.mapWith(Number),
      TotalItem:sql `count(${Pengeluaran.id})`.mapWith(Number)
    }).from(Dana)
    .leftJoin(Pengeluaran,eq(Dana.id,Pengeluaran.danaId))
    .where(
      and(
        eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress),
        like(Dana.bulan, `${selectedYear}-${String(selectedMonth).padStart(2, '0')}%`)
      )
    )
        .groupBy(Dana.id)
        .orderBy(desc(Dana.id));
        
        if (result.length === 0) {
      console.log("Data kosong untuk bulan ini");
    }

        setBudgetList(result);
      }

      useEffect(() => {
      user && getBudgetList();
    }, [user, selectedMonth, selectedYear]);

  return (
    <div className='mt-7'>

      <div className="flex gap-3 mb-4">
        <select
          className="p-2 border rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {monthList.map((month) => (
            <option key={month.value} value={month.value}>{month.name}</option>
          ))}
        </select>

        <select
        className="p-2 border rounded"
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
      >
        {Array.from({ length: endYear - startYear + 1 }, (_, i) => {
          const year = startYear + i;
          return <option key={year} value={year}>{year}</option>;
        })}
      </select>
      </div>

      <div className='grid grid-cols-1
      md:grid-cols-2 lg:grid-cols-3 gap-5'>
      <CreateBudget
      refreshData={()=>getBudgetList()}/>
      {budgetList === null ? (
        // Skeleton loading
        [1, 2, 3, 4, 5].map((item, index) => (
          <div key={index} className='w-full bg-slate-200 rounded-lg h-[150px] animate-pulse'></div>
        ))
      ) : budgetList.length === 0 ? (
        // Kosong, tampilkan pesan
        <div className="col-span-full text-center text-gray-500 animate-pulse">
          <p className="text-lg font-semibold">Belum ada dana keuangan bulan ini 🗓️</p>
          <p className="text-sm">Silakan klik tombol + untuk menambahkan dana baru.</p>
        </div>
      ) : (
        // Tampilkan budget items
        budgetList.map((budget, index) => (
          <BudgetItem budget={budget} key={index} />
        ))
      )}
      </div>
    </div>
  )
}

export default BudgetList
