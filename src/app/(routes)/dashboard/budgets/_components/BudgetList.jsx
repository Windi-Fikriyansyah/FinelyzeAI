"use client"
import React, { useEffect, useState } from 'react'
import CreateBudget from './CreateBudget'
import BudgetItem from './BudgetItem'
import { db } from '../../../../../../utils/dbConfig'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { Dana, Pengeluaran } from '../../../../../../utils/schema'
import { useUser } from '@clerk/nextjs'
import { formatRupiah } from 'utils/formatter';

function BudgetList() {

  const[budgetList,setBudgetList]=useState([]);

  const {user}=useUser();
  useEffect(()=>{
    user&&getBudgetList();
  },[user])
  
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
    .where(eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress))
    .groupBy(Dana.id)
    .orderBy(desc(Dana.id));
    
    setBudgetList(result);
  }

  return (
    <div className='mt-7'>
      <div className='grid grid-cols-1
      md:grid-cols-2 lg:grid-cols-3 gap-5'>
      <CreateBudget
      refreshData={()=>getBudgetList()}/>
      {budgetList?.length>0? budgetList.map((budget,index)=>(
        <BudgetItem budget={budget} key={index} />
      ))
    :[1,2,3,4,5].map((item,index)=>(
      <div key={index} className='w-full bg-slate-200 rounded-lg
      h-[150px] animate-pulse'>
      </div>
    ))
    }
      </div>
    </div>
  )
}

export default BudgetList
