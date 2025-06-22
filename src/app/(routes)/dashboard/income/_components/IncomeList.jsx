"use client"
import { useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs"
import { db } from 'utils/dbConfig'
import { Pemasukan } from 'utils/schema'
import { and, like, desc, sql, eq } from 'drizzle-orm'
import { formatRupiah } from 'utils/formatter'
import { Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
dayjs.locale('id')

function IncomeList({ defaultMonth, defaultYear }) {
  const { user } = useUser()
  const [pemasukanList, setPemasukanList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPemasukan()
    }
  }, [user, defaultMonth, defaultYear]) // gunakan defaultMonth dan defaultYear saja

  const fetchPemasukan = async () => {
    setLoading(true)

    const startDate = `${defaultYear}-${String(defaultMonth).padStart(2, '0')}-01`
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD')

    const result = await db
      .select()
      .from(Pemasukan)
      .where(and(
        like(Pemasukan.createdBy, user?.primaryEmailAddress?.emailAddress),
        sql`tanggal >= ${startDate} AND tanggal <= ${endDate}`
      ))
      .orderBy(desc(Pemasukan.tanggal))

    setPemasukanList(result)
    setLoading(false)
  }

    const handleDelete = async (id) => {
    try {
      await db.delete(Pemasukan).where(eq(Pemasukan.id, id));
      toast.success("Pemasukan berhasil dihapus");
      fetchPemasukan(); // Refresh data
    } catch (error) {
      console.error("Gagal hapus pemasukan:", error);
      toast.error("Gagal menghapus pemasukan");
    }
  };

  return (
    <div className="mt-6">
      {pemasukanList.length === 0 ? (
        <p className="text-gray-400 italic">Belum ada pemasukan bulan ini.</p>
      ) : (
        <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-teal-50 text-teal-800 text-sm">
              <tr>
                <th className="px-4 py-2 border border-gray-200 text-center">Tanggal</th>
                <th className="px-4 py-2 border border-gray-200 text-center">Sumber</th>
                <th className="px-4 py-2 border border-gray-200 text-center">Jumlah</th>
                <th className="px-4 py-2 border border-gray-200 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody>
              {pemasukanList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 text-sm">
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    {dayjs(item.tanggal).format("DD MMMM YYYY")}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    {item.sumber}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center text-emerald-700 font-medium">
                    {formatRupiah(item.jumlah)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <div className="flex justify-center items-center">
                      <Trash2
                        className="w-4 h-4 text-red-500 hover:scale-110 transition cursor-pointer"
                        onClick={() => handleDelete(item.id)}
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

export default IncomeList
