"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function BarChartDashboard({ budgetList }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const chartData =
    budgetList.length > 0
      ? budgetList.map((item) => {
          const jumlah = Number(item.jumlah || 0); // Alokasi dana
          const totalSpend = Number(item.totalSpend || 0); // Pengeluaran sebenarnya
          const sisa = Math.max(jumlah - totalSpend, 0);
          const overbudget = totalSpend > jumlah ? totalSpend - jumlah : 0;
          return {
            nama: item.nama,
            pengeluaran: Math.min(totalSpend, jumlah),
            sisa,
            overbudget,
            alokasi: jumlah,
            totalSpend, 
          };
        })
      : [
          {
            nama: "Belum Ada Data",
            pengeluaran: 0,
            sisa: 0,
            overbudget: 0,
            alokasi: 0,
            totalSpend: 0,
          },
        ];

  const formatRupiah = (value) => `Rp ${value.toLocaleString("id-ID")}`;
  const maxY = Math.max(...chartData.map((d) => d.totalSpend), 1000000);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-md shadow p-3 text-sm">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-gray-700">Alokasi Dana: {formatRupiah(data.alokasi)}</p>
          <p className="text-gray-700">Pengeluaran: {formatRupiah(data.totalSpend)}</p>
          {data.overbudget > 0 && (
            <p className="text-red-600 font-semibold">
              ⚠️ Overbudget Rp {formatRupiah(data.overbudget)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-teal-300 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Aktivitas Bulanan</h2>
        {budgetList.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Belum ada budgeting bulan ini
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="pengeluaranGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2FB98D" />
              <stop offset="100%" stopColor="#127C71" />
            </linearGradient>

            <linearGradient id="overbudgetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>

          <XAxis dataKey="nama" tick={{ fontSize: 11 }} interval={0} />
          <YAxis domain={[0, maxY]} tickFormatter={formatRupiah} tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="pengeluaran"
            name="Pengeluaran"
            stackId="total"
            fill="url(#pengeluaranGradient)"
            barSize={40}
          />

          <Bar
            dataKey="overbudget"
            name="Overbudget"
            stackId="total"
            fill="url(#overbudgetGradient)"
            barSize={40}
          />

          <Bar
            dataKey="sisa"
            name="Sisa Dana"
            stackId="total"
            fill="#A7F3D0"
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex gap-4 text-sm text-gray-700 justify-center">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-[#A7F3D0]" />
          <span>Sisa Dana</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-gradient-to-b from-[#2FB98D] to-[#127C71]" />
          <span>Pengeluaran</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-gradient-to-b from-[#F87171] to-[#B91C1C]" />
          <span>Overbudget</span>
        </div>
      </div>
    </div>
  );
}

export default BarChartDashboard;
