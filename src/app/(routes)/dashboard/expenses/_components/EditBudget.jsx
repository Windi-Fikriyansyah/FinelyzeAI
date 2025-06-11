"use client"
import { Button } from '@/components/ui/button'
import { PenBox } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { formatRupiah } from 'utils/formatter';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUser } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import EmojiPicker from 'emoji-picker-react'
import { db } from 'utils/dbConfig'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner'
import { Dana } from 'utils/schema'

function EditBudget({budgetInfo,refreshData}) {

  const [emojiIcon,setEmojiIcon]=useState(budgetInfo?.icon);
  const [openEmojiPicker,setOpenEmojiPicker]=useState(false)

  const [name,setName]=useState();
  const [amount,setAmount]=useState();

  const {user}=useUser();

  useEffect(()=>{
    if(budgetInfo)
    {
        setEmojiIcon(budgetInfo?.icon)
        setAmount(budgetInfo.jumlah);
        setName(budgetInfo.nama);
    }
  },[budgetInfo])

  const onUpdateBudget=async()=>{
    const result=await db.update(Dana).set({
        nama:name,
        jumlah:amount,
        icon:emojiIcon,
    }).where(eq(Dana.id,budgetInfo.id))
    .returning();

    if(result)
    {
        refreshData()
        toast('Dana berhasil diupdate!')
    }
  }

  if (!budgetInfo) {
  return null;
  }

  return (
    <div>
              <Dialog>
                  <DialogTrigger asChild>
                    <Button className='flex gap-2'> <PenBox/> Edit </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Kategori Dana</DialogTitle>
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
                            <h2 className='text-black font-medium mt-1'>Nama Dana</h2>
                            <Input placeholder="contoh: Keperluan Rumah"
                            defaultValue={budgetInfo?.nama}
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
                                disabled={!(name && amount)}
                                onClick={onUpdateBudget}
                                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white">
                                Update Dana
                            </Button>
                            </DialogClose>

                        </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
    </div>
  )
}

export default EditBudget
