import { eq } from 'drizzle-orm'
import { Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { db } from 'utils/dbConfig'
import { Pengeluaran } from 'utils/schema'
import { formatRupiah } from 'utils/formatter'
import dayjs from 'dayjs';
import 'dayjs/locale/id';
dayjs.locale('id');

function ExpenseListTable({ expensesList, refreshData }) {

  const deleteExpense = async (pengeluaran) => {
    const result = await db.delete(Pengeluaran)
      .where(eq(Pengeluaran.id, pengeluaran.id))
      .returning();

    if (result) {
      toast('Pengeluaran Berhasil Dihapus!');
      refreshData();
    }
  };

  const formatTanggal = (dateStr) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="mt-3">
      <h2 className="font-bold text-lg mb-2">Riwayat Pengeluaran Terbaru</h2>

      <div className="overflow-x-auto rounded-md shadow">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-slate-200 text-left">
            <tr>
              <th className="px-4 py-2 border">Nama</th>
              <th className="px-4 py-2 border">Kategori</th>
              <th className="px-4 py-2 border">Jumlah</th>
              <th className="px-4 py-2 border">Tanggal</th>
              <th className="px-4 py-2 border">Hapus</th>
            </tr>
          </thead>
          <tbody>
            {expensesList.map((pengeluaran, index) => (
              <tr key={pengeluaran.id || index} className="bg-white hover:bg-slate-100">
                <td className="px-4 py-2 border">{pengeluaran.nama}</td>
                <td className="px-4 py-2 border">{pengeluaran.danaNama || '-'}</td>
                <td className="px-4 py-2 border">{formatRupiah(pengeluaran.jumlah)}</td>
                <td className="px-4 py-2 border">{dayjs(new Date(pengeluaran.createdAt)).locale('id').format('D MMMM YYYY, HH:mm')}</td>
                <td className="px-4 py-2 border text-red-600 cursor-pointer">
                  <Trash onClick={() => deleteExpense(pengeluaran)} />
                </td>
              </tr>
            ))}

            {expensesList.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 italic border">
                  Belum ada pengeluaran bulan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseListTable;
