import { eq } from 'drizzle-orm'
import { Trash2 } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { db } from 'utils/dbConfig'
import { Pengeluaran } from 'utils/schema'
import { formatRupiah } from 'utils/formatter' 
import dayjs from 'dayjs';
import 'dayjs/locale/id';
dayjs.locale('id');

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
    <div className="mt-6">
        {expensesList.length === 0 ? (
        <p className="text-gray-400 italic">Belum ada pengeluaran bulan ini.</p>
        ) : (
        <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
        <table className="min-w-full bg-white border-collapse">
            <thead className="bg-teal-50 text-teal-800 text-sm">
            <tr>
                <th className="px-4 py-2 border border-gray-200 text-center">Nama</th>
                <th className="px-4 py-2 border border-gray-200 text-center">Jumlah</th>
                <th className="px-4 py-2 border border-gray-200 text-center">Tanggal</th>
                <th className="px-4 py-2 border border-gray-200 text-center">Hapus</th>
            </tr>
            </thead>
            <tbody>
            {expensesList.map((pengeluaran, index) => (
                <tr key={pengeluaran.id || index} className="hover:bg-slate-50 text-sm">
                <td className="px-4 py-2 border border-gray-200 text-center">{pengeluaran.nama}</td>
                <td className="px-4 py-2 border border-gray-200 text-center text-emerald-700 font-medium">
                    {formatRupiah(pengeluaran.jumlah)}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                    {dayjs(pengeluaran.createdAt).locale('id').format('D MMMM YYYY')}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                    <div className="flex justify-center items-center">
                        <Trash2
                        className="w-4 h-4 text-red-500 hover:scale-110 transition cursor-pointer"
                        onClick={() => deleteExpense(pengeluaran)}
                        />
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        )}
    </div>
    )
}

export default ExpenseListTable
