import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import { db } from '../../../../../../utils/dbConfig';
import { Dana, Pengeluaran } from '../../../../../../utils/schema';
import { toast } from 'sonner';
import moment from 'moment';
import { Loader } from 'lucide-react';
import { formatRupiah } from 'utils/formatter';

function AddExpense({ danaId, user, refreshData, selectedMonth, selectedYear }) {

    const [nama,setName]=useState('');
    const [jumlah,setAmount]=useState('');
    const [loading,setLoading]=useState(false);

    /**
     * Untuk menambahkan pengeluaran
     */
    const addNewExpense=async ()=>{
      setLoading(true)
      const result=await db.insert(Pengeluaran).values({
        nama:nama,
        jumlah: Number(jumlah),
        danaId:danaId,
        createdAt: new Date()
      }).returning({insertId:Dana.id});
    
    setAmount('')
    setName('');
    if(result)
    {
      setLoading(false)
      refreshData()
      toast('Pengeluaran baru ditambahkan!')
    }
    setLoading(false);
  }
  return (
    <div className='border p-5 rounded-lg'>
      <h2 className='font-bold text-lg'>Tambah Pengeluaran Baru</h2>
      <div className='mt-2'>
                    <h2 className='text-black font-medium mt-1'>Kategori Pengeluaran</h2>
                    <Input placeholder="contoh: Belanja Bulanan"
                    value={nama}
                    onChange={(e)=>setName(e.target.value)} />
                  </div>

                  <div className='mt-2'>
                    <h2 className='text-black font-medium mt-1'>Jumlah Pengeluaran</h2>
                    <Input
                      type="number"
                      placeholder="contoh: Rp 500.000"
                      value={jumlah}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    {jumlah && (
                      <p className="text-sm text-black mt-1">
                        Format: <span className="font-semibold">Rp {formatRupiah(jumlah)}</span>
                      </p>
                    )}
                  </div>

                  
                  <Button disabled={!(nama&&jumlah)||loading} 
                  onClick={()=>addNewExpense()}
                  className='mt-3 w-full'>
                    {loading?
                      <Loader className='animate-spin'/>:'Buat Pengeluaran Baru'
                    }
                    </Button>
    </div>
  )
}

export default AddExpense
