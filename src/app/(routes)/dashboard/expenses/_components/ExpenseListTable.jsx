import { eq } from 'drizzle-orm'
import { Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { db } from 'utils/dbConfig'
import { Pengeluaran } from 'utils/schema'
import { formatRupiah } from 'utils/formatter' 

function ExpenseListTable({expensesList,refreshData}) {

    const deleteExpense=async(pengeluaran)=>{
        const result=await db.delete(Pengeluaran)
        .where(eq(Pengeluaran.id,pengeluaran.id))
        .returning();

        if(result)
        {
            toast('Pengeluaran Berhasil Dihapus!')
            refreshData()
        }
    }

  return (
    <div className='mt-3'>
        <h2 className='font-bold text-lg'>Riwayat Pengeluaran Terbaru</h2>
        <div className='grid grid-cols-4 bg-slate-200 p-2 mt-3'>
            <h2 className='font-bold'>Nama</h2>
            <h2 className='font-bold'>Jumlah</h2>
            <h2 className='font-bold'>Tanggal</h2>
            <h2 className='font-bold'>Hapus</h2>
        </div>
        {expensesList.map((pengeluaran, index) => (
        <div key={pengeluaran.id || index} className='grid grid-cols-4 bg-slate-50 p-2'>
            <h2>{pengeluaran.nama}</h2>
            <h2>{formatRupiah(pengeluaran.jumlah)}</h2>
            <h2>{pengeluaran.createdAt}</h2>
            <h2>
            <Trash
                className='text-red-600 cursor-pointer'
                onClick={() => deleteExpense(pengeluaran)}
            />
            </h2>
        </div>
        ))}
    </div>
  )
}

export default ExpenseListTable
