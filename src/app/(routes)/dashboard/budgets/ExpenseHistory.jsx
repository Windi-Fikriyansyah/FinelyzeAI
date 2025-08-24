"use client";

import React, { useEffect, useState } from "react";
import { formatRupiah } from "utils/formatter";
import { SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

import { db } from "utils/dbConfig";
import { eq, and, sql } from "drizzle-orm";
import { Pengeluaran, Dana } from "utils/schema";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

function ExpenseHistory({ selectedMonth, selectedYear, refreshData, searchKeyword = "" }) {
  const [expensesList, setExpensesList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", direction: "desc" });
  const [editingItem, setEditingItem] = useState(null);
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const res = await db
      .select({
        id: Pengeluaran.id,
        nama: Pengeluaran.nama,
        jumlah: Pengeluaran.jumlah,
        createdAt: Pengeluaran.createdAt,
        danaNama: Dana.nama,
      })
      .from(Pengeluaran)
      .leftJoin(Dana, eq(Pengeluaran.danaId, Dana.id))
      .where(
        and(
          eq(sql`EXTRACT(MONTH FROM ${Pengeluaran.createdAt})`, selectedMonth),
          eq(sql`EXTRACT(YEAR FROM ${Pengeluaran.createdAt})`, selectedYear)
        )
      )
      .orderBy(sql`${Pengeluaran.createdAt} DESC`);

    setExpensesList(res);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedList = [...expensesList].sort((a, b) => {
    let valueA = a[sortConfig.field];
    let valueB = b[sortConfig.field];

    if (sortConfig.field === "jumlah") {
      valueA = parseFloat(valueA);
      valueB = parseFloat(valueB);
    } else if (sortConfig.field === "createdAt") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    } else {
      valueA = valueA?.toString().toLowerCase() ?? "";
      valueB = valueB?.toString().toLowerCase() ?? "";
    }

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredList = sortedList.filter((item) =>
    item.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.danaNama?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const deleteExpense = async (item) => {
    await db.delete(Pengeluaran).where(eq(Pengeluaran.id, item.id));
    toast.success("Pengeluaran berhasil dihapus!");
    fetchData();
    if (refreshData) refreshData();
  };

  const handleUpdate = async () => {
    setLoading(true);
    await db.update(Pengeluaran)
      .set({ nama, jumlah: Number(jumlah) })
      .where(eq(Pengeluaran.id, editingItem.id));
    setLoading(false);
    toast.success("Pengeluaran berhasil diperbarui!");
    setEditingItem(null);
    fetchData();
    if (refreshData) refreshData();
  };

  const sortIcon = (field) => {
    if (sortConfig.field !== field) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="mt-10 space-y-3">
      <h2 className="font-bold text-lg text-black">Riwayat Pengeluaran</h2>
      <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse text-sm">
            <thead className="bg-teal-50 text-teal-800 sticky top-0 z-10 shadow-sm">
              <tr>
                {["createdAt", "nama", "danaNama", "jumlah"].map((field) => (
                  <th
                    key={field}
                    className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer"
                    onClick={() => handleSort(field)}
                  >
                    {field === "nama"
                      ? "Nama"
                      : field === "danaNama"
                      ? "Kategori"
                      : field === "jumlah"
                      ? "Jumlah"
                      : "Tanggal"}
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      {sortIcon(field)}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-2 border border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 italic border border-gray-200">
                    Tidak ada pengeluaran yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {dayjs(item.createdAt).format("D MMMM YYYY")}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">{item.nama}</td>
                    <td className="px-4 py-2 border border-gray-200 text-center">{item.danaNama || "-"}</td>
                    <td className="px-4 py-2 border border-gray-200 text-right">
                      {formatRupiah(item.jumlah)}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="flex gap-3 justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <SquarePen
                              className="w-4 h-4 text-blue-600 hover:scale-110 cursor-pointer"
                              onClick={() => {
                                setEditingItem(item);
                                setNama(item.nama);
                                setJumlah(item.jumlah);
                              }}
                            />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Pengeluaran</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 mt-2">
                              <div>
                                <label className="text-sm font-medium text-black">Nama</label>
                                <Input value={nama} onChange={(e) => setNama(e.target.value)} />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-black">Jumlah</label>
                                <Input
                                  type="number"
                                  value={jumlah}
                                  onChange={(e) => setJumlah(e.target.value)}
                                />
                                {jumlah && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Format: <span className="font-semibold">Rp {formatRupiah(jumlah)}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button
                                  disabled={!(nama && jumlah) || loading}
                                  onClick={handleUpdate}
                                  className="w-full bg-gradient-to-t from-[#2FB98D] to-[#127C71] text-white"
                                >
                                  {loading ? <Loader className="animate-spin w-4 h-4" /> : "Simpan Perubahan"}
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Trash2 className="w-4 h-4 text-red-500 hover:scale-110 cursor-pointer" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengeluaran?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <p className="text-sm text-gray-600">
                              Data pengeluaran <strong>{item.nama}</strong> akan dihapus permanen. Lanjutkan?
                            </p>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => deleteExpense(item)}
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

export default ExpenseHistory;
