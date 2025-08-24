'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from 'utils/dbConfig';
import { Pemasukan } from 'utils/schema';
import { and, like, desc, sql, eq } from 'drizzle-orm';
import { formatRupiah } from 'utils/formatter';
import {
  Trash2,
  ShoppingCart,
  PenBox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

dayjs.locale('id');

const sortIcon = (field, currentField, direction) => {
  if (field !== currentField) return '⇅';
  return direction === 'asc' ? '↑' : '↓';
};

export default function IncomeList({ defaultMonth, defaultYear, searchKeyword = '' }) {
  const { user } = useUser();
  const router = useRouter();
  
  const [pemasukanList, setPemasukanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (user) fetchPemasukan();
  }, [user, defaultMonth, defaultYear, searchKeyword]);

const fetchPemasukan = async () => {
  setLoading(true);

  const startDate = dayjs(`${defaultYear}-${String(defaultMonth).padStart(2, '0')}-01`).startOf('month').toDate();
  const endDate = dayjs(startDate).endOf('month').toDate();

  const result = await db
    .select()
    .from(Pemasukan)
    .where(
      and(
        eq(Pemasukan.createdBy, user?.primaryEmailAddress?.emailAddress),
        sql`${Pemasukan.tanggal} >= ${startDate} AND ${Pemasukan.tanggal} <= ${endDate}`
      )
    )
    .orderBy(desc(Pemasukan.tanggal));

  const filtered = result.filter((item) =>
    item.sumber.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  setPemasukanList(filtered);
  setTotalPemasukan(filtered.reduce((acc, cur) => acc + Number(cur.jumlah), 0));
  setChartData(aggregateByDate(filtered));
  setLoading(false);
};

const aggregateByDate = (data) => {
  const dailyMap = {};
  data.forEach((item) => {
    const dateKey = dayjs(item.tanggal).format('DD MMM');
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + Number(item.jumlah);
  });

  const result = Object.entries(dailyMap).map(([tanggal, jumlah]) => ({
    tanggal,
    jumlah,
  }));

  return result.sort(
    (a, b) => dayjs(b.tanggal, 'DD MMM') - dayjs(a.tanggal, 'DD MMM')
  );
};

  const handleDelete = async (id) => {
    try {
      await db.delete(Pemasukan).where(eq(Pemasukan.id, id));
      toast.success('Pemasukan berhasil dihapus!');
      setConfirmDelete(null);
      fetchPemasukan();
    } catch {
      toast.error('Gagal menghapus pemasukan.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await db
        .update(Pemasukan)
        .set({
          sumber: editing.sumber,
          jumlah: parseFloat(editing.jumlah),
          tanggal: editing.tanggal,
        })
        .where(eq(Pemasukan.id, editing.id));
      toast.success('Pemasukan berhasil diperbarui!');
      setEditing(null);
      fetchPemasukan();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui pemasukan.');
    }
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedList = [...pemasukanList].sort((a, b) => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    if (sortConfig.field === 'tanggal') {
      return (new Date(a.tanggal) - new Date(b.tanggal)) * dir;
    }
    if (sortConfig.field === 'sumber') {
      return a.sumber.localeCompare(b.sumber) * dir;
    }
    if (sortConfig.field === 'jumlah') {
      return (Number(a.jumlah) - Number(b.jumlah)) * dir;
    }
    return 0;
  });

  return (
    <div className="space-y-4 mt-6">
      <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 shadow-sm text-teal-900 text-sm font-medium">
        💰 Total pemasukan bulan ini:{' '}
        <span className="font-bold">Rp {formatRupiah(totalPemasukan)}</span>
      </div>

      {chartData.length > 0 && (
        <div className="w-full h-64 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h3 className="text-sm font-semibold text-black mb-4">📈 Grafik Pemasukan</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(val) => `Rp ${formatRupiah(val)}`}
                width={100}
              />
              <Tooltip
                formatter={(value) => [`Rp ${formatRupiah(value)}`, 'Jumlah']}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="jumlah"
                name="Jumlah"
                stroke="#2FB98D"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {pemasukanList.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500 border border-dashed border-teal-300 rounded-xl bg-gradient-to-br from-[#f0faf7] to-white shadow-sm">
          <ShoppingCart className="w-10 h-10 text-teal-500 mb-3" />
          <p className="text-lg font-semibold text-gray-600 mb-1">
            Belum ada Pemasukan tercatat bulan ini
          </p>
          <p className="text-sm">
            Silakan klik tombol{' '}
            <span className="font-semibold text-teal-700">
              + Tambah Pemasukan{' '}
            </span>
            untuk mulai mencatat.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
          <table className="min-w-full bg-white border-collapse text-sm">
            <thead className="bg-teal-50 text-teal-800">
              <tr>
                <th
                  className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer"
                  onClick={() => handleSort('tanggal')}
                >
                  Tanggal
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {sortIcon('tanggal', sortConfig.field, sortConfig.direction)}
                  </span>
                </th>
                <th
                  className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer"
                  onClick={() => handleSort('sumber')}
                >
                  Sumber
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {sortIcon('sumber', sortConfig.field, sortConfig.direction)}
                  </span>
                </th>
                <th
                  className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer"
                  onClick={() => handleSort('jumlah')}
                >
                  Jumlah
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {sortIcon('jumlah', sortConfig.field, sortConfig.direction)}
                  </span>
                </th>
                <th className="px-4 py-2 border border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="text-center border px-4 py-2">
                    {dayjs(item.tanggal).format('DD MMMM YYYY')}
                  </td>
                  <td className="text-center border px-4 py-2">{item.sumber}</td>
                  <td className="text-right border px-4 py-2">{formatRupiah(item.jumlah)}</td>
                  <td className="text-center border px-4 py-2">
                    <div className="flex justify-center gap-3">
                      <PenBox
                        className="w-4 h-4 text-blue-500 hover:scale-110 cursor-pointer"
                        onClick={() =>
                          setEditing({
                            ...item,
                            tanggal: new Date(item.tanggal),
                          })
                        }
                      />
                      <Trash2
                        className="w-4 h-4 text-red-500 hover:scale-110 cursor-pointer"
                        onClick={() => setConfirmDelete(item)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Dialog open={true} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Edit Pemasukan</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <label className="text-sm font-medium">Sumber</label>
              <Input
                value={editing.sumber}
                onChange={(e) => setEditing({ ...editing, sumber: e.target.value })}
              />
              <label className="text-sm font-medium">Jumlah</label>
              <Input
                type="number"
                value={editing.jumlah}
                onChange={(e) => setEditing({ ...editing, jumlah: e.target.value })}
              />
              <label className="text-sm font-medium text-center">Tanggal</label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={editing.tanggal}
                  onSelect={(date) => setEditing({ ...editing, tanggal: date })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Batal
              </Button>
              <Button onClick={handleEditSubmit}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {confirmDelete && (
        <Dialog open={true} onOpenChange={() => setConfirmDelete(null)}>
          <DialogTrigger asChild><span /></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Pemasukan?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Apakah kamu yakin ingin menghapus <b>{confirmDelete.sumber}</b>?
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(confirmDelete.id)}>
                Ya
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
