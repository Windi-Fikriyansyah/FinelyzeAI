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
  <div className="mt-6 space-y-3">
    <h2 className="font-bold text-lg text-black">Riwayat Pengeluaran Terbaru</h2>

    <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
      {/* Tambahkan max-h agar bisa scroll vertikal */}
      <div className="max-h-[400px] overflow-y-auto">
        <table className="min-w-full bg-white border-collapse text-sm">
          <thead className="bg-teal-50 text-teal-800 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-2 border border-gray-200 text-center">Nama</th>
              <th className="px-4 py-2 border border-gray-200 text-center">Kategori</th>
              <th className="px-4 py-2 border border-gray-200 text-center">Jumlah</th>
              <th className="px-4 py-2 border border-gray-200 text-center">Tanggal</th>
              <th className="px-4 py-2 border border-gray-200 text-center">Hapus</th>
            </tr>
          </thead>
          <tbody>
            {expensesList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 italic border border-gray-200">
                  Belum ada pengeluaran bulan ini.
                </td>
              </tr>
            ) : (
              expensesList.map((pengeluaran, index) => (
                <tr key={pengeluaran.id || index} className="hover:bg-slate-50">
                  <td className="px-4 py-2 border border-gray-200 text-center">{pengeluaran.nama}</td>
                  <td className="px-4 py-2 border border-gray-200 text-center">{pengeluaran.danaNama || '-'}</td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);



}

export default ExpenseListTable;
