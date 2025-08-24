"use client";
import React, { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { db } from "utils/dbConfig";
import { Pengeluaran, Pemasukan, RiwayatTabungan } from "utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { formatRupiah } from "utils/formatter";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

function TransactionListTable({ transaksiList, refreshData }) {
  const [sortConfig, setSortConfig] = useState({
    field: "tanggal",
    direction: "desc",
  });

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
    if (!transaksiList) return [];
    const sorted = [...transaksiList].sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [transaksiList, sortConfig]);


  const getBadgeStyle = (tipe) => {
    const base = "inline-block text-center min-w-[90px] px-2 py-1 rounded-full font-medium";
    switch (tipe) {
      case "Pengeluaran":
        return `${base} bg-red-100 text-red-700`;
      case "Pemasukan":
        return `${base} bg-green-100 text-green-700`;
      case "Tabungan":
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <h2 className="font-bold text-lg text-black">Riwayat Transaksi</h2>

      <div className="overflow-x-auto border border-teal-300 rounded-xl shadow-sm">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse text-sm">
            <thead className="bg-teal-50 text-teal-800 sticky top-0 z-10 shadow-sm">
              <tr>
                {["tanggal", "kategori", "jumlah"].map((field) => (
                  <th
                    key={field}
                    className="relative px-4 py-2 border border-gray-200 text-center cursor-pointer font-medium"
                    onClick={() => handleSort(field)}
                  >
                    {field[0].toUpperCase() + field.slice(1)}
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      {sortIcon(field)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500 italic border border-gray-200">
                    Belum ada transaksi bulan ini.
                  </td>
                </tr>
              ) : (
                sortedList.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {dayjs(item.tanggal).format("D MMMM YYYY")}
                    </td>
                    
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <span className={`px-2 py-1 text-xs rounded-md font-medium ${getBadgeStyle(item.tipe)}`}>
                        {item.tipe}
                      </span>
                    </td>

                    <td className="px-4 py-2 border border-gray-200 text-right">
                      {formatRupiah(item.jumlah)}
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

export default TransactionListTable;
