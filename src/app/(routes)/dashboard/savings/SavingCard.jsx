"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "utils/dbConfig";
import { Tabungan, RiwayatTabungan } from "utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { formatRupiah } from "utils/formatter";
import dayjs from "dayjs";
import { Trash2, ArrowRight, Check, Fullscreen, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SavingCard({ item, onRefresh }) {
  const router = useRouter();
  const [nabungInput, setNabungInput] = useState("");

  const handleDelete = async () => {
    try {
      await db.delete(Tabungan).where(eq(Tabungan.id, item.id));
      toast.success("Tabungan dihapus.");
      onRefresh();
    } catch (error) {
      toast.error("Gagal menghapus tabungan.");
    }
  };

  const handleNabung = async () => {
    const nominal = parseFloat(nabungInput);
    if (!nominal || nominal <= 0) return toast.error("Masukkan nominal yang valid.");

    try {
      const newTotal = parseFloat(item.terkumpul) + nominal;

      await db.update(Tabungan)
        .set({ terkumpul: newTotal })
        .where(eq(Tabungan.id, item.id));

      await db.insert(RiwayatTabungan).values({
        tabunganId: item.id,
        nominal,
        tanggal: new Date(),
      });

      toast.success("Berhasil menabung!");
      setNabungInput("");
      onRefresh();
    } catch (error) {
      toast.error("Gagal menabung.");
    }
  };

  const sudahTercapai = parseFloat(item.terkumpul) >= parseFloat(item.target);
  const persentase = Math.min((item.terkumpul / item.target) * 100, 100).toFixed(1);
  const target = dayjs(item.targetDate);

  return (
    <div
      className={`border rounded-lg bg-gradient-to-br from-[#E6FAF3] to-white border border-teal-200 shadow-sm hover:shadow-md p-5 space-y-4 ${
        sudahTercapai ? "border-teal-400 ring-1 ring-teal-200" : "border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gradient-to-t from-[#b8fae5] via-[#6ce1cb] to-[#17b4a5] rounded-full">
            {item.icon}
          </div>
          <div>
            <h2 className="font-semibold">{item.nama}</h2>
            {item.targetDate && (
              <p className="text-sm text-gray-600 mt-1">🎯 {target.format("DD MMM YYYY")}</p>
            )}
            {sudahTercapai && (
              <p className="text-green-600 font-semibold text-sm">✅ Target Tercapai!</p>
            )}
          </div>
        </div>

        {/* Icons */}
        <div className="flex gap-2">
          <Button
            className="bg-white shadow-sm"
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/savings/${item.id}`)}
          >
            <BookOpen className="w-5 h-5 text-teal-700" />
          </Button>
          <Button
            className="bg-white shadow-sm"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 ">
        <span>Terkumpul Rp {formatRupiah(item.terkumpul)}</span>
        <span>Target Rp {formatRupiah(item.target)}</span>
      </div>

      <div className="w-full h-2 bg-teal-100 rounded-full mt-1">
        <div
          className="h-2 bg-gradient-to-r from-[#2FB98D] to-[#127C71] rounded-full"
          style={{ width: `${persentase}%` }}
        />
      </div>

      {/* Form Nabung */}
{!sudahTercapai && (
  <div className="mt-3 space-y-2">
    <label className="text-sm text-gray-600">Masukkan jumlah dana yang ingin ditabung</label>
    <div className="flex gap-2 items-center">
      <Input
        type="number"
        placeholder="Contoh: 500000"
        className="flex-1 bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-200"
        value={nabungInput}
        onChange={(e) => setNabungInput(e.target.value)}
      />

      <Button
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleNabung();
        }}
        className="bg-gradient-to-r from-[#2FB98D] to-[#127C71] text-white shadow-sm hover:shadow-md"
      >
        <Check className="w-5 h-5" />
      </Button>
        </div>
        {nabungInput && (
          <p className="text-xs text-gray-500">
            Format: <span className="font-semibold text-black">Rp {formatRupiah(nabungInput)}</span>
          </p>
        )}
      </div>
    )}
    </div>
  );
}
