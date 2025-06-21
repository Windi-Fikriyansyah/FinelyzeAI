"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { formatRupiah } from 'utils/formatter' 
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

  import EmojiPicker from 'emoji-picker-react'
  import { Dana } from 'utils/schema';
  import { db } from 'utils/dbConfig';
  import { toast } from 'sonner';

function CreateBudget({refreshData}) {

  const [emojiIcon,setEmojiIcon]=useState('😊');
  const [openEmojiPicker,setOpenEmojiPicker]=useState(false)

  const [name,setName]=useState();
  const [amount,setAmount]=useState();

  const searchParams = useSearchParams();
const selectedMonth = Number(searchParams.get('month')) || new Date().getMonth() + 1;
const selectedYear = Number(searchParams.get('year')) || new Date().getFullYear();

  const {user}=useUser();
  const onCreateBudget = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('User belum login atau email belum tersedia.');
      return;
    }
  
try {
  const now = new Date();
  const bulanFormatted = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`; // sesuai pilihan user

const result = await db.insert(Dana)
  .values({
    nama: name,
    jumlah: amount,
    icon: emojiIcon,
    createdBy: user.primaryEmailAddress.emailAddress,
    bulan: bulanFormatted // <== sekarang mengikuti dropdown
  })
  .returning({ insertId: Dana.id });

  if (result) {
  if (refreshData) refreshData(); 
  toast('Dana baru berhasil dibuat!');
}

} catch (error) {
  console.error(error);
  toast.error('Gagal membuat dana.');
}

  };
  

  return (
    <div>
      
      <Dialog>
          <DialogTrigger asChild>
            <div className='bg-slate-100 p-10 rounded-md
              items-center flex flex-col border-2 border-dashed
              cursor-pointer hover:shadow-md'>
              <h2 className='text-3xl'>+</h2>
              <h2>Buat Dana Baru</h2>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Dana Baru</DialogTitle>
              <DialogDescription>

              </DialogDescription>

                <div className='mt-5'>
                  <Button variant="outline"
                  className="text-lg"
                  onClick={()=>setOpenEmojiPicker(!openEmojiPicker)}
                  >{emojiIcon}</Button>
                  <div className='absolute z-20'>
                    <EmojiPicker
                    open={openEmojiPicker}
                    onEmojiClick={(e)=>{
                      setEmojiIcon(e.emoji)
                      setOpenEmojiPicker(false)
                    }}
                    />
                  </div>

                  <div className='mt-2'>
                    <h2 className='text-black font-medium mt-1'>Kategori Dana</h2>
                    <Input placeholder="contoh: Belanja Bulanan"
                    onChange={(e)=>setName(e.target.value)} />
                  </div>

                  <div className='mt-2'>
                    <h2 className='text-black font-medium my-1'>Jumlah Dana</h2>
                    <Input
                      type="number"
                      placeholder="contoh: Rp 500.000"
                      onChange={(e)=>setAmount(e.target.value)} />
                    
                    {amount && (
                      <p className='text-sm text-muted-foreground mt-1'>
                        Format: <span className="font-medium text-black">Rp {formatRupiah(amount)}</span>
                      </p>
                    )}
                  </div>


                  <DialogClose asChild>
                  <Button 
                    disabled={!(name&&amount)}
                    onClick={()=>onCreateBudget()}
                    className="mt-5 w-full px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] 
                    hover:brightness-105 hover:shadow-lg transition-all duration-450 ease-in-out">Buat Dana</Button>
                    </DialogClose>
                </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
    </div>
  )
}

export default CreateBudget
