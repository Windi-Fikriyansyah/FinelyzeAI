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
import { Trash2, ArrowLeft, PenBox, Sparkles, Check } from "lucide-react";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [editEmoji, setEditEmoji] = useState("\uD83D\uDCB0");
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [nabungInput, setNabungInput] = useState("");
  const [sortBy, setSortBy] = useState("tanggal");
  const [sortDirection, setSortDirection] = useState("desc");
  const [editingRiwayat, setEditingRiwayat] = useState(null);
  const [editNominal, setEditNominal] = useState("");
  const [editTanggal, setEditTanggal] = useState(new Date());

  const sortIcon = (field) => {
    if (field !== sortBy) return "\u21C5";
    return sortDirection === "asc" ? "\u2191" : "\u2193";
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleNabung = async () => {
  const nominal = Number(nabungInput.replace(/[^\d]/g, '')) || 0;
  if (!nominal || nominal <= 0) {
    toast.error("Masukkan nominal yang valid.");
    return;
  }

  try {
    const currentTotal = Number(data.terkumpul) || 0;
    const newTotal = currentTotal + nominal;

    await db.update(Tabungan)
      .set({ terkumpul: newTotal })
      .where(eq(Tabungan.id, Number(id)));

    await db.insert(RiwayatTabungan).values({
      tabunganId: Number(id),
      nominal,
      tanggal: new Date(),
    });

    if (newTotal >= Number(data.target) && !data.tanggalTercapai) {
      await db.update(Tabungan)
        .set({ tanggalTercapai: new Date() })
        .where(eq(Tabungan.id, Number(id)));
    }

    toast.success("Menabung berhasil!");
    setNabungInput("");
    fetchData();
    fetchRiwayat();
  } catch (err) {
    console.error("Nabung Error:", err);
    toast.error("Gagal menabung.");
  }
};


  const fetchData = async () => {
    setLoading(true);
    const result = await db.select().from(Tabungan).where(eq(Tabungan.id, Number(id)));
    setData(result[0]);
    setLoading(false);
  };

  const fetchRiwayat = async () => {
    const result = await db.select().from(RiwayatTabungan).where(eq(RiwayatTabungan.tabunganId, Number(id)));
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
      toast.error("Semua data harus diisi!");
      return;
    }
    try {
      await db.update(Tabungan)
        .set({ nama: editNama, target: parseFloat(editTarget), targetDate: new Date(editTargetDate), icon: editEmoji })
        .where(eq(Tabungan.id, Number(id)));
      toast.success("Tabungan berhasil diperbarui!");
      setEditDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal memperbarui tabungan!");
    }
  };

  const handleDeleteTabungan = async () => {
    try {
      await db.delete(Tabungan).where(eq(Tabungan.id, Number(id)));
      toast.success("Tabungan berhasil dihapus!");
      router.push("/dashboard/savings");
    } catch {
      toast.error("Gagal menghapus tabungan.");
    }
  };

  const handleDeleteRiwayat = async (riwayatId, nominal) => {
    try {
      const updatedTotal = parseFloat(data.terkumpul) - parseFloat(nominal);
      await db.update(Tabungan).set({ terkumpul: updatedTotal }).where(eq(Tabungan.id, Number(id)));
      await db.delete(RiwayatTabungan).where(eq(RiwayatTabungan.id, riwayatId));
      toast.success("Riwayat menabung dihapus.");
      fetchData();
      fetchRiwayat();
    } catch {
      toast.error("Gagal menghapus riwayat menabung.");
    }
  };

const handleEditRiwayat = async () => {
  try {
    const oldNominal = editingRiwayat.nominal;
    const newNominal = parseFloat(editNominal);

    await db.update(RiwayatTabungan)
      .set({ nominal: newNominal, tanggal: editTanggal })
      .where(eq(RiwayatTabungan.id, editingRiwayat.id));

    if (newNominal !== oldNominal) {
      const selisih = newNominal - oldNominal;
      await db.update(Tabungan)
        .set({ terkumpul: parseFloat(data.terkumpul) + selisih })
        .where(eq(Tabungan.id, data.id));
    }

    toast.success("Riwayat tabungan berhasil diedit!");
    setEditingRiwayat(null);
    fetchData();
    fetchRiwayat();
  } catch (err) {
    console.error("Edit Riwayat Error:", err);
    toast.error("Gagal edit riwayat.");
  }
};

  if (loading || !data) return <div className="p-4">Loading...</div>;
  const target = dayjs(data.targetDate);
  const today = dayjs();
  const daysLeft = target.diff(today, "day");
  const selisih = Math.max(data.target - data.terkumpul, 0);
  const rekomendasiHarian = daysLeft >= 0 ? Math.ceil(selisih / (daysLeft + 1)) : null;
  const sudahTercapai = parseFloat(data.terkumpul) >= parseFloat(data.target);
  const persentase = Math.min((data.terkumpul / data.target) * 100, 100).toFixed(1);

  return (
    <div className="w-full min-h-screen px-4 md:px-10 py-10 bg-white space-y-6">
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
              <AlertDialogAction onClick={handleDeleteTabungan} className="bg-red-500 hover:bg-red-600">Ya</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Edit Tabungan</DialogTitle>
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
                onEmojiClick={(e) => {
                  setEditEmoji(e.emoji);
                  setShowEditEmojiPicker(false);
                }}
              />
            </div>
          )}

          <label className="block text-sm font-medium text-black mb-1">
            Nama Tabungan
            </label>
          <Input
            value={editNama}
            onChange={(e) => setEditNama(e.target.value)}
            placeholder="Nama tabungan"
          />
         <div className="space-y-1 mt-2">

          <label className="block text-sm font-medium text-black mb-1">
            Nominal Target
            </label>
          <Input
            type="number"
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
            placeholder="Target baru"
          />

          {editTarget && (
            <p className="text-sm text-muted-foreground mt-1">
              Format:{" "}
              <span className="font-medium text-black">
                Rp {formatRupiah(editTarget)}
              </span>
            </p>
          )}
        </div>
          <div>
            <label className="text-center block text-sm font-medium text-black mb-1">
            Target Tanggal Tercapai
            </label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={editTargetDate}
                onSelect={(date) => {
                  if (date instanceof Date && !isNaN(date)) {
                    setEditTargetDate(date);
                  }
                }}
              />
            </div>
          </div>
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

      <div className="w-full bg-gradient-to-br from-[#E6FAF3] to-white border border-teal-200 p-6 rounded-xl shadow space-y-4">
        <div className="flex items-start justify-between">
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
            </div>
          </div>

          {sudahTercapai && (
            <div className="flex items-center gap-2 animate-pulse text-right">
              <div className="text-2xl">🏆</div>
              <div>
                <p className="text-green-700 font-bold text-sm">Target Tercapai!</p>
                {data.tanggalTercapai && (
                  <p className="text-xs text-gray-500">
                    Selesai dalam{" "}
                    <span className="font-medium text-black">
                      {dayjs(data.tanggalTercapai).diff(dayjs(data.createdAt), "day")} hari
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Terkumpul Rp {formatRupiah(data.terkumpul)}</span>
          <span>Target Rp {formatRupiah(data.target)}</span>
        </div>

        <div className="w-full h-2 bg-teal-100 rounded-full mt-1 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-[#2FB98D] to-[#127C71] rounded-full"
          style={{ width: `${persentase}%` }}
        />
        </div>

        <div>
          <p className="text-xs text-teal-700 mt-1">{persentase}% tercapai</p>
        </div>

        {!sudahTercapai && (
          <div className="space-y-2">
            <label className="text-sm text-gray-800 font-medium">Masukkan Tabungan</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Contoh: 500000"
                className="flex-1 border border-gray-300 focus:border-teal-500 focus:ring-teal-300"
                value={nabungInput}
                onChange={(e) => setNabungInput(e.target.value)}
              />
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#2FB98D] to-[#127C71] text-white hover:brightness-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNabung();
                }}
              >
                <Check className="w-5 h-5" />
              </Button>
            </div>
            {nabungInput && (
              <p className="text-xs text-gray-500">
                Format: <span className="text-black font-semibold">Rp {formatRupiah(nabungInput)}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl mt-4 bg-gradient-to-br from-[#FFFBE6] to-white border border-[#F9D84A] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-[#FFE66D] via-[#F9D84A] to-[#e4bb14] text-white shadow-md animate-pulse">
            <Sparkles className="text-black w-5 h-5" />
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

      <div className="w-full mt-6">
        <h3 className="text-lg font-semibold mb-3">📄 Riwayat Tabunganmu</h3>

        <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-teal-50 text-teal-800 text-sm">
              <tr>
                <th
                  onClick={() => handleSort("tanggal")}
                  className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer"
                >
                  <span>Tanggal</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {sortIcon("tanggal")}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("nominal")}
                  className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer"
                >
                  <span>Nominal</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {sortIcon("nominal")}
                  </span>
                </th>
                <th className="px-4 py-2 border border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center italic text-gray-500 py-4 border border-gray-200">
                    Belum ada catatan penambahan.
                  </td>
                </tr>
              ) : (
                [...riwayat]
                  .sort((a, b) => {
                    let valA = a[sortBy];
                    let valB = b[sortBy];

                    if (sortBy === "tanggal") {
                      valA = new Date(valA);
                      valB = new Date(valB);
                    }

                    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
                    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 text-sm">
                      <td className="px-4 py-2 border border-gray-200 text-center">
                        {dayjs(item.tanggal).format("DD MMMM YYYY")}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-center">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="px-4 py-2 border border-gray-200">
                        <div className="flex justify-center items-center gap-3">

                          {/* Edit Riwayat */}
                          <Dialog
                            open={editingRiwayat?.id === item.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setEditingRiwayat(item);
                                setEditNominal(item.nominal);
                                setEditTanggal(new Date(item.tanggal));
                              } else {
                                setEditingRiwayat(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <PenBox className="w-4 h-4 text-blue-500 hover:scale-110 transition cursor-pointer" />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-center text-lg font-bold">Edit Riwayat Menabung</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4 mt-2">
                                <div>
                                  <p className="text-sm font-medium text-left mb-1 text-gray-800">Nominal</p>
                                  <Input
                                    type="number"
                                    value={editNominal}
                                    onChange={(e) => setEditNominal(parseFloat(e.target.value) || 0)}
                                  />
                                  <p className="text-xs text-left mt-1 text-gray-500">
                                    Format:{" "}
                                    <span className="text-black font-semibold">Rp {formatRupiah(editNominal)}</span>
                                  </p>
                                </div>

                                <p className="text-sm font-medium text-center text-gray-800">Tanggal</p>

                                <div className="flex justify-center">
                                  <Calendar
                                    mode="single"
                                    selected={editTanggal}
                                    onSelect={(date) => {
                                      if (date instanceof Date && !isNaN(date)) {
                                        setEditTanggal(date);
                                      }
                                    }}
                                  />
                                </div>

                                <DialogClose asChild>
                                  <Button
                                    onClick={handleEditRiwayat}
                                    className="w-full bg-gradient-to-tr from-[#2FB98D] to-[#127C71] text-white mt-3 hover:brightness-110"
                                  >
                                    Simpan Perubahan
                                  </Button>
                                </DialogClose>

                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Trash2 className="w-4 h-4 text-red-500 hover:scale-110 transition cursor-pointer" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Riwayat Menabung?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Nominal ini akan dihapus dan total tabungan akan disesuaikan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteRiwayat(item.id, item.nominal)}
                                >
                                  Ya
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
