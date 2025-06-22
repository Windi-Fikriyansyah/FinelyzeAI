"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "utils/dbConfig";
import { Tabungan, RiwayatTabungan } from "utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { formatRupiah } from "utils/formatter";
import { Trash2, ArrowLeft, PenBox, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export default function SavingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editTargetDate, setEditTargetDate] = useState(new Date());
  const [editEmoji, setEditEmoji] = useState("💰");
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await db.select().from(Tabungan).where(eq(Tabungan.id, Number(id)));
    setData(result[0]);
    setLoading(false);
  };

  const fetchRiwayat = async () => {
    const result = await db
      .select()
      .from(RiwayatTabungan)
      .where(eq(RiwayatTabungan.tabunganId, Number(id)));
    setRiwayat(result);
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchRiwayat();
    }
  }, [id]);

const handleEditSave = async () => {
  if (!editNama || !editTarget || !editTargetDate) {
    toast.error("Semua data harus diisi.");
    return;
  }

  try {
  await db
    .update(Tabungan)
    .set({
      nama: editNama,
      target: parseFloat(editTarget),
      targetDate: new Date(editTargetDate), // ✅ Pastikan format Date
      icon: editEmoji,
    })
      .where(eq(Tabungan.id, Number(id)));

    toast.success("Tabungan berhasil diperbarui.");
    setEditDialogOpen(false);
    fetchData();
  } catch (error) {
    toast.error("Gagal memperbarui tabungan.");
  }
};

console.log("Target Date Edit:", editTargetDate, typeof editTargetDate);

  const handleDeleteTabungan = async () => {
    try {
      await db.delete(Tabungan).where(eq(Tabungan.id, Number(id)));
      toast.success("Tabungan berhasil dihapus.");
      router.push("/dashboard/savings");
    } catch {
      toast.error("Gagal menghapus tabungan.");
    }
  };

  const handleDeleteRiwayat = async (riwayatId, nominal) => {
    try {
      const updatedTotal = parseFloat(data.terkumpul) - parseFloat(nominal);
      await db
        .update(Tabungan)
        .set({ terkumpul: updatedTotal })
        .where(eq(Tabungan.id, Number(id)));

      await db
        .delete(RiwayatTabungan)
        .where(eq(RiwayatTabungan.id, riwayatId));
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
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <Button
        onClick={() => router.push("/dashboard/savings")}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Button>

      <div className="flex gap-2 items-center">
        {/* Tombol Edit */}
        <Button
          onClick={() => {
            setEditNama(data.nama);
            setEditTarget(data.target);
            const parsedDate = dayjs(data.targetDate);
            setEditTargetDate(parsedDate.isValid() ? parsedDate.toDate() : new Date());
            setEditEmoji(data.icon);
            setEditDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded text-white 
                    bg-gradient-to-t from-[#2FB98D] to-[#127C71] 
                    hover:brightness-105 hover:shadow-lg 
                    transition-all duration-450 ease-in-out"> <PenBox/> Edit </Button>
                    
        {/* Tombol Hapus dengan Konfirmasi */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="flex items-center gap-2 px-4 py-2 rounded text-white 
              bg-gradient-to-t from-[#f87171] to-[#b91c1c] 
              hover:brightness-105 hover:shadow-lg 
              transition-all duration-450 ease-in-out"
            >
              <Trash2 /> Hapus
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tabungan dan seluruh riwayatnya akan dihapus secara permanen. Lanjutkan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTabungan}>Ya, hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tabungan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <Button
            variant="outline"
            onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
          >
            {editEmoji}
          </Button>
          {showEditEmojiPicker && (
            <div className="absolute z-20 max-w-xs">
              <EmojiPicker
                height={300}
                width={250}
                onEmojiClick={(e) => {
                  setEditEmoji(e.emoji);
                  setShowEditEmojiPicker(false);
                }}
              />
            </div>
          )}
          <Input
            value={editNama}
            onChange={(e) => setEditNama(e.target.value)}
            placeholder="Nama tabungan"
          />
          <Input
            type="number"
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
            placeholder="Target baru"
          />
          <Calendar
            mode="single"
            selected={editTargetDate}
            onSelect={(date) => {
              if (date instanceof Date && !isNaN(date)) {
                setEditTargetDate(date);
              }
            }}
          />
          <DialogClose asChild>
            <Button
              className="w-full bg-gradient-to-r from-[#2FB98D] to-[#127C71] text-white mt-3"
              onClick={handleEditSave}
            >
              Simpan Perubahan
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>

      {/* Kartu Info Tabungan */}
      <div className="w-full bg-gradient-to-br from-[#E6FAF3] to-white border border-teal-200 p-6 rounded-xl shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gradient-to-t from-[#b8fae5] via-[#6ce1cb] to-[#17b4a5] rounded-full">
            {data.icon}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{data.nama}</h2>
            {data.targetDate && (
              <p className="text-sm text-gray-600 mt-1">
                🎯 {target.format("DD MMM YYYY")}
              </p>
            )}
            {sudahTercapai && (
              <p className="text-green-600 font-semibold text-sm">
                ✅ Target Tercapai!
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Terkumpul Rp {formatRupiah(data.terkumpul)}</span>
          <span>Target Rp {formatRupiah(data.target)}</span>
        </div>

        <div className="w-full h-2 bg-teal-100 rounded-full mt-1">
          <div
            className="h-2 bg-gradient-to-r from-[#2FB98D] to-[#127C71] rounded-full"
            style={{ width: `${persentase}%` }}
          />
        </div>
      </div>

      {/* Saran */}
      <div className="p-6 rounded-2xl mt-4 bg-gradient-to-br from-[#FFFBE6] to-white border border-[#F9D84A] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-[#FFE66D] via-[#F9D84A] to-[#e4bb14] text-white shadow-md animate-pulse">
            <Sparkles className="w-5 h-5" />
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

      {/* Histori Tabungan */}
      <div className="w-full mt-6">
        <h3 className="text-lg font-semibold mb-3">📄 Histori Tabunganmu</h3>
        {riwayat.length === 0 ? (
          <p className="text-gray-400 italic">Belum ada catatan penambahan.</p>
        ) : (
          <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-teal-50 text-teal-800 text-sm">
                <tr>
                  <th className="px-4 py-2 border border-gray-200 text-center">Tanggal</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Nominal</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 text-sm">
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {dayjs(item.tanggal).format("DD MMMM YYYY")}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center text-emerald-700 font-medium">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      <div className="flex justify-center items-center">
                        <Trash2
                          className="w-4 h-4 text-red-500 hover:scale-110 transition cursor-pointer"
                          onClick={() => handleDeleteRiwayat(item.id, item.nominal)}
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
    </div>
  );
}
