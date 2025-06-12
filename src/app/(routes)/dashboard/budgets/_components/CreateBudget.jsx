"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { formatRupiah } from 'utils/formatter' 
import dayjs from 'dayjs';

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

  const {user}=useUser();
  const onCreateBudget = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('User belum login atau email belum tersedia.');
      return;
    }
  
try {
  const now = new Date();
  const bulanFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // contoh: 2025-06

  const result = await db.insert(Dana)
    .values({
      nama: name,
      jumlah: amount,
      icon: emojiIcon,
      createdBy: user.primaryEmailAddress.emailAddress,
      bulan: bulanFormatted   // <-- ditambahkan
    })
    .returning({ insertId: Dana.id });

  if (result) {
    refreshData();
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
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white">Buat Dana</Button>
                    </DialogClose>
                </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
    </div>
  )
}

export default CreateBudget
