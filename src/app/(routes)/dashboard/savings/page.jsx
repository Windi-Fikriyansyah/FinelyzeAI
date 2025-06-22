"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "utils/dbConfig";
import { eq } from "drizzle-orm";
import { Tabungan } from "utils/schema";
import SavingCard from "./SavingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogClose
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import EmojiPicker from "emoji-picker-react";
import { formatRupiah } from "utils/formatter";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function SavingsPage() {
  const { user } = useUser();
  const [tabunganAktif, setTabunganAktif] = useState([]);
  const [tabunganTercapai, setTabunganTercapai] = useState([]);

  // Form state
  const [openDialog, setOpenDialog] = useState(false);
  const [nama, setNama] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState(null); // ✅ Biarkan kosong sampai user pilih
  const [emoji, setEmoji] = useState("💰");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fetchData = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const result = await db
      .select()
      .from(Tabungan)
      .where(eq(Tabungan.createdBy, user.primaryEmailAddress.emailAddress));

    const aktif = result.filter(t => parseFloat(t.terkumpul) < parseFloat(t.target));
    const tercapai = result.filter(t => parseFloat(t.terkumpul) >= parseFloat(t.target));

    setTabunganAktif(aktif);
    setTabunganTercapai(tercapai);
  };

  const handleDelete = async (id) => {
    try {
      await db.delete(Tabungan).where(eq(Tabungan.id, id));
      toast.success("Tabungan berhasil dihapus.");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus tabungan.");
    }
  };

  const handleCreate = async () => {
    if (!nama || !target || !targetDate) {
      toast.error("Lengkapi semua field.");
      return;
    }

    try {
      await db.insert(Tabungan).values({
        nama,
        target: parseFloat(target),
        targetDate,
        terkumpul: 0,
        icon: emoji,
        selesai: false, // ✅ Tambahkan ini
        createdBy: user.primaryEmailAddress.emailAddress,
        createdAt: new Date(), // <-- ini penting agar sesuai schema
      });
      toast.success("Tabungan berhasil dibuat.");
      setOpenDialog(false);
      setNama("");
      setTarget("");
      setTargetDate(null);
      setEmoji("💰");
      fetchData();
    } catch (err) {
      toast.error("Gagal membuat tabungan.");
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  return (
    <div className="w-full px-4 md:px-10 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tabungan Ku</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-300 ease-in-out">
                + Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Tabungan Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-3">
                <Button variant="outline" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  {emoji}
                </Button>
                {showEmojiPicker && (
                  <div className="absolute z-20 max-w-xs">
                    <EmojiPicker
                      height={300}
                      width={250}
                      onEmojiClick={(e) => {
                        setEmoji(e.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
                <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama tabungan" />
                <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target (contoh: 1000000)" />
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        setTargetDate(date);
                      }
                    }}
                  />
                <DialogClose asChild>
                  <Button className="w-full bg-gradient-to-r from-[#2FB98D] to-[#127C71] text-white mt-3" onClick={handleCreate}>
                    Simpan Tabungan
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-gray-600 mt-2">
        Wujudkan impianmu dengan mulai menabung. Yuk, catat dan pantau progresmu di sini!</p>
      </div>

      {/* Tabungan Aktif */}
      {tabunganAktif.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada tabungan aktif.</p>
      ) : (
        <div className="grid gap-4">
          {tabunganAktif.map((item) => (
            <SavingCard key={item.id} item={item} onRefresh={fetchData} />
          ))}
        </div>
      )}

      {/* Tabungan Tercapai */}
      <div className="pt-10">
        <h2 className="text-2xl font-semibold mb-4"> ✔ Tabungan Tercapai</h2>
        {tabunganTercapai.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada tabungan yang tercapai.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white rounded-md overflow-hidden">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="text-left px-4 py-2">Nama</th>
                  <th className="text-left px-4 py-2">Target</th>
                  <th className="text-left px-4 py-2">Tanggal Terkumpul</th>
                  <th className="text-left px-4 py-2">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {tabunganTercapai.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">{item.icon} {item.nama}</td>
                    <td className="px-4 py-2">Rp {formatRupiah(item.target)}</td>
                    <td className="px-4 py-2">
                      {item.targetDate ? dayjs(item.targetDate).format("DD MMM YYYY") : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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
