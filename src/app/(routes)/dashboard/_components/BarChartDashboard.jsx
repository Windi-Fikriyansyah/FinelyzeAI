"use client"
import React, { useEffect, useState } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function BarChartDashboard({budgetList}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className='border rounded-lg p-5'>
        <h2 className='font-bold text-lg'>Aktivitas</h2>
      <ResponsiveContainer width={'80%'} height={300}>
        <BarChart
        data={budgetList}
        margin={{
          top:5,
          right:5,
          left:10,
          bottom:5
        }}
        >
          <XAxis dataKey='nama'/>
          <YAxis/>
          <Tooltip/>
          <Legend/>
          <Bar dataKey='totalSpend' name='Pengeluaran' stackId="a" fill='#4845d2'/>
          <Bar dataKey='jumlah' name='Dana' stackId="a" fill='#C3C2FF'/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartDashboard
