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
          bulan: bulanFormatted 
        })
        .returning({ insertId: Dana.id });

        if (result) {
        if (refreshData) refreshData(); 
        toast('Kategori pengeluaran berhasil dibuat!');
      }

      } catch (error) {
        console.error(error);
        toast.error('Gagal membuat kategori pengeluaran.');
      }
      };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-300 ease-in-out"
        >
          + Buat Kategori Pengeluaran
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader >
          <DialogTitle className="text-center">Buat Kategori Pengeluaran</DialogTitle>
          <DialogDescription />

          <div className="mt-5 text-left space-y-3">
            <Button
              variant="outline"
              className="text-lg"
              onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
            >
              {emojiIcon}
            </Button>
            <div className="absolute z-20">
              <EmojiPicker
                open={openEmojiPicker}
                onEmojiClick={(e) => {
                  setEmojiIcon(e.emoji);
                  setOpenEmojiPicker(false);
                }}
              />
            </div>

            <div className="mt-2">
              <h2 className="text-black font-medium mt-1">Nama Kategori</h2>
              <Input
                placeholder="contoh: Belanja Bulanan"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mt-2">
              <h2 className="text-black font-medium my-1">Perkiraan Alokasi Dana</h2>
              <Input
                type="number"
                placeholder="contoh: Rp 500.000"
                onChange={(e) => setAmount(e.target.value)}
              />

              {amount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Format:{" "}
                  <span className="font-medium text-black">
                    Rp {formatRupiah(amount)}
                  </span>
                </p>
              )}
            </div>

            <DialogClose asChild>
              <Button
                disabled={!(name && amount)}
                onClick={() => onCreateBudget()}
                className="mt-5 w-full px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-450 ease-in-out"
              >
                Buat Dana
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBudget
