"use client";
import { Button } from '@/components/ui/button';
import { PenBox } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { formatRupiah } from 'utils/formatter';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import EmojiPicker from 'emoji-picker-react';
import { db } from 'utils/dbConfig';
import { eq } from 'drizzle-orm';
import { toast } from 'sonner';
import { Dana } from 'utils/schema';

function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo?.icon);
      setAmount(budgetInfo.jumlah);
      setName(budgetInfo.nama);
    }
  }, [budgetInfo]);

  const onUpdateBudget = async () => {
    const result = await db
      .update(Dana)
      .set({
        nama: name,
        jumlah: amount,
        icon: emojiIcon,
      })
      .where(eq(Dana.id, budgetInfo.id))
      .returning();

    if (result) {
      refreshData();
      toast.success('Dana berhasil diupdate!');
    }
  };

  if (!budgetInfo) return null;

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="flex items-center gap-2 px-4 py-2 rounded text-white 
              bg-gradient-to-t from-[#2FB98D] to-[#127C71] 
              hover:brightness-105 hover:shadow-lg 
              transition-all duration-450 ease-in-out"
          >
            <PenBox /> Edit
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori Dana</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 relative">
            {/* Emoji Picker */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
              >
                {emojiIcon}
              </Button>
              {openEmojiPicker && (
                <div className="absolute z-50 top-12">
                  <EmojiPicker
                    height={300}
                    width={250}
                    onEmojiClick={(e) => {
                      setEmojiIcon(e.emoji);
                      setOpenEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Nama */}
            <div>
              <h2 className="text-black font-medium mb-1">Nama Kategori</h2>
              <Input
                placeholder="contoh: Kebutuhan Rumah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Jumlah Dana */}
            <div>
              <h2 className="text-black font-medium mb-1">Target Dana</h2>
              <Input
                type="number"
                placeholder="contoh: 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Format: <span className="font-medium text-black">Rp {formatRupiah(amount)}</span>
                </p>
              )}
            </div>

            {/* Tombol Update */}
            <DialogClose asChild>
              <Button
                disabled={!(name && amount)}
                onClick={onUpdateBudget}
                className="mt-5 w-full px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-450 ease-in-out"
              >
              Update Kategori
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditBudget;
