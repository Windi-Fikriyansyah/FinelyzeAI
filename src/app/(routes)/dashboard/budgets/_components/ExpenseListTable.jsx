"use client";
import React, { useMemo, useState } from "react";
import { Trash2, PenBox } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

import { eq } from "drizzle-orm";
import { db } from "utils/dbConfig";
import { Pengeluaran } from "utils/schema";
import { formatRupiah } from "utils/formatter";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

function ExpenseListTable({ expensesList, refreshData }) {
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", direction: "desc" });
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortIcon = (field) => {
    if (sortConfig.field !== field) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedList = useMemo(() => {
    const sorted = [...expensesList].sort((a, b) => {
      let valA = a[sortConfig.field];
      let valB = b[sortConfig.field];

      if (sortConfig.field === "jumlah") {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (sortConfig.field === "createdAt") {
        valA = new Date(valA);
        valB = new Date(valB);
      } else {
        valA = valA?.toString().toLowerCase() ?? "";
        valB = valB?.toString().toLowerCase() ?? "";
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [expensesList, sortConfig]);

  const handleDelete = async (pengeluaran) => {
    const result = await db.delete(Pengeluaran).where(eq(Pengeluaran.id, pengeluaran.id)).returning();
    if (result) {
      toast.success("Pengeluaran berhasil dihapus!");
      setConfirmDelete(null);
      refreshData();
    }
  };

  const handleEditSubmit = async () => {
    await db
      .update(Pengeluaran)
      .set({
        nama: editing.nama,
        jumlah: parseFloat(editing.jumlah),
        createdAt: editing.createdAt,
      })
      .where(eq(Pengeluaran.id, editing.id));
    toast.success("Pengeluaran berhasil diubah!");
    setEditing(null);
    refreshData();
  };

  return (
    <div className="mt-6">
      {expensesList.length === 0 ? (
        <p className="text-gray-400 italic">Belum ada pengeluaran bulan ini.</p>
      ) : (
        <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
          <table className="min-w-full bg-white border-collapse text-sm">
            <thead className="bg-teal-50 text-teal-800 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="relative w-1/4 px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("createdAt")}>
                  Tanggal
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("createdAt")}</span>
                </th>
                <th className="relative w-1/4 px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("nama")}>
                  Nama
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("nama")}</span>
                </th>
                <th className="relative w-1/4 px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("jumlah")}>
                  Jumlah
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("jumlah")}</span>
                </th>
                <th className="w-1/4 px-4 py-2 border border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((pengeluaran, index) => (
                <tr key={pengeluaran.id || index} className="hover:bg-slate-50">
                  <td className="text-center border px-4 py-2">{dayjs(pengeluaran.createdAt).format("D MMMM YYYY")}</td>
                  <td className="text-center border px-4 py-2">{pengeluaran.nama}</td>
                  <td className="text-right border px-4 py-2">{formatRupiah(pengeluaran.jumlah)}</td>
                  <td className="text-center border px-4 py-2">
                    <div className="flex justify-center gap-3">
                      <PenBox
                        className="w-4 h-4 text-blue-500 hover:scale-110 cursor-pointer"
                        onClick={() =>
                          setEditing({
                            ...pengeluaran,
                            createdAt: new Date(pengeluaran.createdAt),
                          })
                        }
                      />
                      <Trash2
                        className="w-4 h-4 text-red-500 hover:scale-110 cursor-pointer"
                        onClick={() => setConfirmDelete(pengeluaran)}
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
              <DialogTitle className="text-center ">Edit Pengeluaran</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={editing.nama}
                onChange={(e) => setEditing({ ...editing, nama: e.target.value })}
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
                  selected={editing.createdAt}
                  onSelect={(date) => setEditing({ ...editing, createdAt: date })}
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
          <DialogTrigger asChild><span /></DialogTrigger> {/* ← ini penting */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Pengeluaran?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Apakah kamu yakin ingin menghapus <b>{confirmDelete.nama}</b>?
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(confirmDelete)}>
                Ya
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ExpenseListTable;
