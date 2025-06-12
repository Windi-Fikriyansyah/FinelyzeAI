"use client"
import React,{useState, useEffect} from 'react'
import{ UserButton, useUser } from "@clerk/nextjs";
import { db } from 'utils/dbConfig';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import CardInfo from './_components/CardInfo'
import BarChartDashboard from './_components/BarChartDashboard'
import { Dana, Pengeluaran } from 'utils/schema';
import BudgetItem from './budgets/_components/BudgetItem';
import ExpenseListTable from './expenses/_components/ExpenseListTable';
import getFinancialAdvice from 'utils/getFinancialAdvice';

function Dashboard() {
  const {user} = useUser();

const[budgetList,setBudgetList]=useState([]);
const[expensesList,setExpensesList]=useState([]);
const [advice, setAdvice] = useState("");

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

  // Hitung total dana dan total pengeluaran
  const totalDana = result.reduce((acc, item) => acc + item.jumlah, 0);
  const totalPengeluaran = result.reduce((acc, item) => acc + item.totalSpend, 0);

  // Ambil saran dari AI
  const adviceResponse = await getFinancialAdvice(totalDana, totalPengeluaran);
  setAdvice(adviceResponse);

    getAllExpenses();
  }

  /**
   * Untuk mendapatkan semua pengeluaran
   */
  const getAllExpenses=async()=>{
    const result=await db.select({
      id:Pengeluaran.id,
      nama:Pengeluaran.nama,
      jumlah:Pengeluaran.jumlah,
      createdAt:Pengeluaran.createdAt
    }).from(Dana)
    .rightJoin(Pengeluaran,eq(Dana.id,Pengeluaran.danaId))
    .where(eq(Dana.createdBy,user?.primaryEmailAddress.emailAddress))
    .orderBy(desc(Pengeluaran.id));
    setExpensesList(result);
  }

  return (
    <div className='p-8'>
<h2 className="font-bold text-4xl capitalize">Hi, {user?.fullName} 👋🏻</h2>
<p className="text-gray-600">Ini dia ringkasan keuanganmu. Yuk, cek dan kelola!</p>

{advice && (
  <div className="bg-emerald-50 text-emerald-800 p-4 mt-4 rounded-md border border-emerald-300">
    💡 <strong>Saran Keuangan:</strong> {advice}
  </div>
)}

      <CardInfo budgetList={budgetList}/>
      <div className='grid grid-cols-1 md:grid-cols-3 mt-6 gap-5'>
        <div className='md:col-span-2'>
          <BarChartDashboard
            budgetList={budgetList}
          />

          <ExpenseListTable
          expensesList={expensesList}
            refreshData={()=>getBudgetList()}
          />

        </div>
        <div className='grid gap-5'>
          <h2 className='font-bold text-lg'>Kategori Dana</h2>
          {budgetList.map((budget,index)=>(
            <BudgetItem budget={budget} key={index}/>
          ))}
        </div>
      </div>
    </div> 
    )
}

export default Dashboard;