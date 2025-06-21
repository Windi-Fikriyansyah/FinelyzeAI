"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "utils/dbConfig";
import { Tabungan, RiwayatTabungan } from "utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatRupiah } from "utils/formatter";
import { Trash2, ArrowLeft, Sparkles, Lightbulb } from "lucide-react";
import dayjs from "dayjs";

export default function SavingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const result = await db.select().from(Tabungan).where(eq(Tabungan.id, id));
    setData(result[0]);
    setLoading(false);
  };

  const fetchRiwayat = async () => {
    const result = await db
      .select()
      .from(RiwayatTabungan)
      .where(eq(RiwayatTabungan.tabunganId, id));
    setRiwayat(result);
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchRiwayat();
    }
  }, [id]);

  const handleDeleteTabungan = async () => {
    try {
      await db.delete(Tabungan).where(eq(Tabungan.id, id));
      toast.success("Tabungan berhasil dihapus.");
      router.push("/dashboard/savings");
    } catch {
      toast.error("Gagal menghapus tabungan.");
    }
  };

  const handleDeleteRiwayat = async (riwayatId, nominal) => {
    try {
      const updatedTotal = parseFloat(data.terkumpul) - parseFloat(nominal);
      await db.update(Tabungan)
        .set({ terkumpul: updatedTotal })
        .where(eq(Tabungan.id, id));

      await db.delete(RiwayatTabungan).where(eq(RiwayatTabungan.id, riwayatId));
      toast.success("Riwayat nabung dihapus.");
      fetchData();
      fetchRiwayat();
    } catch {
      toast.error("Gagal menghapus riwayat.");
    }
  };

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const target = dayjs(data.targetDate);
  const today = dayjs();
  const daysLeft = target.diff(today, "day");
  const selisih = Math.max(data.target - data.terkumpul, 0);
  const rekomendasiHarian = daysLeft > 0 ? Math.ceil(selisih / daysLeft) : null;
  const sudahTercapai = parseFloat(data.terkumpul) >= parseFloat(data.target);
  const persentase = Math.min((data.terkumpul / data.target) * 100, 100);

  return (
    <div className="w-full min-h-screen px-4 md:px-10 py-10 bg-white space-y-6">
      {/* Header Aksi */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/savings")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <Button variant="destructive" onClick={handleDeleteTabungan}>
          <Trash2 className="w-4 h-4 mr-2" /> Hapus
        </Button>
      </div>

      {/* Kartu Info Tabungan */}
      <div className="w-full bg-gradient-to-br from-[#E6FAF3] to-white border border-teal-200 p-6 rounded-xl shadow space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gradient-to-t from-[#b8fae5] via-[#6ce1cb] to-[#17b4a5] rounded-full">
            {data.icon}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{data.nama}</h2>
            {data.targetDate && (
              <p className="text-sm text-gray-600 mt-1">🎯 {target.format("DD MMM YYYY")}</p>
            )}
            {sudahTercapai && (
              <p className="text-green-600 font-semibold text-sm">✅ Target Tercapai!</p>
            )}
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Terkumpul Rp {formatRupiah(data.terkumpul)}</span>
          <span>Target Rp {formatRupiah(data.target)}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-teal-100 rounded-full mt-1">
          <div
            className="h-2 bg-gradient-to-r from-[#2FB98D] to-[#127C71] rounded-full"
            style={{ width: `${persentase}%` }}
          />
        </div>
      </div>

      {/* Saran Tabungan */}
      <div className="p-6 rounded-2xl mt-4 bg-gradient-to-br from-[#FFFBE6] to-white border border-[#F9D84A] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-[#FFE66D] via-[#F9D84A] to-[#e4bb14] text-white shadow-md animate-pulse">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Saran</h2>
            <p className="text-sm text-gray-700">
              {rekomendasiHarian !== null && selisih > 0 ? (
                <>
                  Untuk mencapai target dalam {daysLeft} hari lagi, kamu perlu menabung sekitar{" "}
                  <b>Rp {formatRupiah(rekomendasiHarian)}</b> per hari.
                </>
              ) : (
                <>🎯 Tidak ada saran — target sudah tercapai atau sudah lewat.</>
              )}
            </p>
          </div>
        </div>
      </div>

{/* Histori Penambahan Tabungan */}
<div className="w-full">
  <h3 className="text-lg font-semibold mb-3">📄 Histori Tabunganmu</h3>
  {riwayat.length === 0 ? (
    <p className="text-gray-500 text-sm">Belum ada catatan penambahan.</p>
  ) : (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm text-left bg-white">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2">Tanggal</th>
            <th className="px-4 py-2">Nominal</th>
            <th className="px-4 py-2">Hapus</th>
          </tr>
        </thead>
        <tbody>
          {riwayat.map((item) => (
            <tr key={item.id} className="border-t hover:bg-slate-50">
              <td className="px-4 py-2">{dayjs(item.tanggal).format("DD MMM YYYY")}</td>
              <td className="px-4 py-2">Rp {formatRupiah(item.nominal)}</td>
              <td className="px-4 py-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteRiwayat(item.id, item.nominal)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


    </div>
  );
}
