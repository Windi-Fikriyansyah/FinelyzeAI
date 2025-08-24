"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "utils/formatter";
import dayjs from "dayjs";

export default function SavingCard({ item }) {
  const router = useRouter();
  const sudahTercapai = parseFloat(item.terkumpul) >= parseFloat(item.target);
  const persentase = Math.min((item.terkumpul / item.target) * 100, 100).toFixed(1);
  const target = dayjs(item.targetDate);

  return (
    <div
      onClick={() => router.push(`/dashboard/savings/${item.id}`)}
      title="Klik untuk lihat detail"
      className="w-full p-4 md:p-5 rounded-xl bg-white border border-teal-200 shadow hover:shadow-md hover:border-teal-300 cursor-pointer transition-all duration-300 flex items-center gap-4"
    >
      <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl rounded-full bg-gradient-to-br from-[#b8fae5] via-[#6ce1cb] to-[#17b4a5] text-white shadow">
        {item.icon}
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">{item.nama}</h3>
          {item.targetDate && (
            <p className="text-sm text-gray-800 mt-1 sm:mt-0">🎯 {target.format("DD MMM YYYY")}</p>
          )}
        </div>

        {sudahTercapai && (
          <p className="text-green-600 text-xs font-medium mt-1 animate-pulse">✅ Target Tercapai</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mt-1">
          <span>
            <span className="font-medium text-gray-800">Rp {formatRupiah(item.terkumpul)}</span> / Rp{" "}
            {formatRupiah(item.target)}
          </span>
          <span className="text-teal-700 font-medium text-xs sm:text-sm mt-1 sm:mt-0">
            {persentase}% Tercapai
          </span>
        </div>

        <div className="w-full h-2 relative rounded-full bg-teal-100 overflow-hidden mt-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2FB98D] to-[#127C71] rounded-full transition-all duration-700"
            style={{ width: `${persentase}%` }}
          />
        </div>
      </div>
    </div>
  );
}
