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
import { Search, Trash2, SquarePen } from "lucide-react";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function SavingsPage() {
  const { user } = useUser();
  const [tabunganAktif, setTabunganAktif] = useState([]);
  const [tabunganTercapai, setTabunganTercapai] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });

  const handleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { field, direction: "asc" };
      }
    });
  };

  const sortIcon = (field) => {
    if (sortConfig.field !== field) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedTabungan = [...tabunganTercapai].sort((a, b) => {
    const { field, direction } = sortConfig;
    if (!field || !direction) return 0;

    let aValue = a[field];
    let bValue = b[field];

    if (field.includes("Date") || field === "tanggalTercapai") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [nama, setNama] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState(null);
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
      toast.success("Tabungan berhasil dihapus!");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus tabungan!");
    }
  };

  const handleCreate = async () => {
    if (!nama || !target || !targetDate) {
      toast.error("Lengkapi semua field!");
      return;
    }

    try {
      await db.insert(Tabungan).values({
        nama,
        target: parseFloat(target),
        targetDate,
        terkumpul: 0,
        icon: emoji,
        selesai: false,
        createdBy: user.primaryEmailAddress.emailAddress,
        createdAt: new Date(),
      });
      toast.success("Tabungan berhasil dibuat!");
      setOpenDialog(false);
      setNama("");
      setTarget("");
      setTargetDate(null);
      setEmoji("💰");
      fetchData();
    } catch (err) {
      toast.error("Gagal membuat tabungan!");
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const filteredAktif = tabunganAktif.filter((t) =>
    t.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTercapai = sortedTabungan.filter((t) =>
    t.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-10 py-10 space-y-10">
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Tabungan Ku</h1>
            <p className="text-gray-600 mt-2">
              Wujudkan impianmu dengan mulai menabung. Yuk, catat dan pantau progresmu di sini!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3">
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search . . ."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3"
              />
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="px-4 py-2 text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-300">
                  + Buat Tabungan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">Tambah Tabungan Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-3">
                  <Button variant="outline" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    {emoji}
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute z-20 max-w-xs">
                      <EmojiPicker
                        onEmojiClick={(e) => {
                          setEmoji(e.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                  <h2 className="text-black font-medium mt-1">Nama Tabungan</h2>
                  <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="contoh: Liburan ke Bali" />
                  <h2 className="text-black font-medium mt-1">Nominal Target</h2>
                  <div className="space-y-1 mt-2">
                    <Input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="contoh: 3000000"
                    />
                    {target && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Format: <span className="font-medium text-black">Rp {formatRupiah(target)}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-center block text-sm font-medium text-black mb-1">Target Tanggal Tercapai</label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={(date) => {
                          if (date instanceof Date && !isNaN(date)) {
                            setTargetDate(date);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogClose asChild>
                    <Button className="w-full bg-gradient-to-r from-[#2FB98D] to-[#127C71] text-white mt-3" onClick={handleCreate}>
                      Simpan Tabungan
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {filteredAktif.length === 0 ? (
        <div className="w-full border border-dashed border-teal-300 rounded-xl p-6 bg-teal-50/40 text-center text-teal-800 shadow-sm">
          {searchTerm ? "Tabungan sesuai keyword tersebut tidak tersedia." : "Belum ada tabungan aktif"}
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredAktif.map((item) => (
            <SavingCard key={item.id} item={item} onRefresh={fetchData} />
          ))}
        </div>
      )}

      <div className="pt-10">
        <h2 className="text-2xl font-semibold mb-4 text-black">Tabungan Tercapai</h2>
        <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full bg-white border-collapse text-sm">
              <thead className="bg-teal-50 text-teal-800 sticky top-0 z-10 shadow-sm text-sm">
                <tr>
                  <th className="px-4 py-2 border border-gray-200 text-center">Tabungan</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Target (Rp)</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Tanggal Target</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Tanggal Tercapai</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Status</th>
                  <th className="px-4 py-2 border border-gray-200 text-center">Aksi</th>
                </tr>
              </thead>
            <tbody>
              {filteredTercapai.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-500 italic border border-gray-200"
                  >
                    {searchTerm
                      ? "Tabungan sesuai keyword tersebut tidak tersedia."
                      : "Belum ada tabungan yang tercapai."}
                  </td>
                </tr>
              ) : (
                filteredTercapai.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <span className="text-lg">{item.icon}</span> {item.nama}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      Rp {formatRupiah(item.target)}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {item.targetDate
                        ? dayjs(item.targetDate).format("DD MMM YYYY")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {item.tanggalTercapai
                        ? dayjs(item.tanggalTercapai).format("DD MMM YYYY")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {item.tanggalTercapai && item.targetDate && (() => {
                        const tanggalTercapai = dayjs(item.tanggalTercapai);
                        const targetDate = dayjs(item.targetDate);
                        if (tanggalTercapai.isAfter(targetDate, "day")) {
                          return (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md w-[100px]">
                              Terlambat
                            </span>
                          );
                        } else if (tanggalTercapai.isSame(targetDate, "day")) {
                          return (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-md w-[100px]">
                              Tepat Waktu
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md w-[100px]">
                              Lebih Cepat
                            </span>
                          );
                        }
                      })()}
                    </td>

                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="flex gap-3 justify-center items-center">
                        <Link href={`/dashboard/savings/${item.id}`} title="Lihat Detail">
                          <SquarePen className="w-4 h-4 text-blue-600 hover:scale-110 transition cursor-pointer" />
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Trash2 className="w-4 h-4 text-red-500 hover:scale-110 transition cursor-pointer" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Tabungan?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <p className="text-sm text-gray-600">
                              Data tabungan <strong>{item.nama}</strong> yang telah
                              tercapai akan dihapus secara permanen. Lanjutkan?
                            </p>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
