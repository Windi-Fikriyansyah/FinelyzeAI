"use client";

import React, { useState, useMemo } from "react";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "utils/dbConfig";
import { Pengeluaran } from "utils/schema";
import { formatRupiah } from "utils/formatter";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

function ExpenseListTable({ expensesList, refreshData }) {
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", direction: "desc" });

  const handleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "asc" };
    });
  };

  const sortIcon = (field) => {
    if (sortConfig.field !== field) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedList = useMemo(() => {
    if (!expensesList) return [];
    const sorted = [...expensesList].sort((a, b) => {
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
    return sorted;
  }, [expensesList, sortConfig]);

  const deleteExpense = async (pengeluaran) => {
    const result = await db.delete(Pengeluaran)
      .where(eq(Pengeluaran.id, pengeluaran.id))
      .returning();

    if (result) {
      toast("Pengeluaran berhasil dihapus!");
      refreshData();
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <h2 className="font-bold text-lg text-black">Riwayat Pengeluaran</h2>

      <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse text-sm">
            <thead className="bg-teal-50 text-teal-800 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("nama")}>
                  Nama
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("nama")}</span>
                </th>
                <th className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("danaNama")}>
                  Kategori
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("danaNama")}</span>
                </th>
                <th className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("jumlah")}>
                  Jumlah
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("jumlah")}</span>
                </th>
                <th className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer" onClick={() => handleSort("createdAt")}>
                  Tanggal
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">{sortIcon("createdAt")}</span>
                </th>
                <th className="px-4 py-2 border border-gray-200 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 italic border border-gray-200">
                    Belum ada pengeluaran bulan ini.
                  </td>
                </tr>
              ) : (
                sortedList.map((pengeluaran, index) => (
                  <tr key={pengeluaran.id || index} className="hover:bg-slate-50">
                    <td className="px-4 py-2 border border-gray-200 text-center">{pengeluaran.nama}</td>
                    <td className="px-4 py-2 border border-gray-200 text-center">{pengeluaran.danaNama || "-"}</td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {formatRupiah(pengeluaran.jumlah)}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {dayjs(pengeluaran.createdAt).format("D MMMM YYYY")}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      <div className="flex justify-center items-center">
                        <Trash2
                          className="w-4 h-4 text-red-500 hover:scale-110 transition cursor-pointer"
                          onClick={() => deleteExpense(pengeluaran)}
                        />
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

export default ExpenseListTable;
