"use client";

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function BarChartDashboard({ budgetList }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const chartData = budgetList.length > 0
    ? budgetList.map(item => ({
        nama: item.nama,
        totalSpend: Number(item.totalSpend || 0),
        jumlah: Number(item.jumlah || 0),
      }))
    : [{ nama: 'Belum Ada Data', totalSpend: 0, jumlah: 0 }];

  const formatRupiahTick = (value) => `Rp ${value.toLocaleString('id-ID')}`;

  const maxJumlah = Math.max(
    ...budgetList.map(item => Number(item.jumlah || 0)),
    0
  );

  return (
    <div className='border rounded-lg p-5 bg-white'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-lg'>Aktivitas</h2>
        {budgetList.length === 0 && (
          <p className='text-sm text-gray-500 italic'>
            Belum ada budgeting bulan ini
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 10, bottom: 40 }}
        >
          <XAxis
            dataKey="nama"
            angle={0}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={[0, maxJumlah]}
            tickFormatter={formatRupiahTick}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
          />
          <Legend />
          <Bar dataKey="jumlah" name="Dana" fill="#C3C2FF" />
          <Bar dataKey="totalSpend" name="Pengeluaran" fill="#4845d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartDashboard;
