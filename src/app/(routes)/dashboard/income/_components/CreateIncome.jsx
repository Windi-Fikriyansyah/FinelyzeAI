"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@clerk/nextjs";
import { formatRupiah } from "utils/formatter";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "utils/dbConfig";
import { Pemasukan } from "utils/schema";
import { toast } from "sonner";

function CreateIncome({ refreshData }) {
  const [sumber, setSumber] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggalPemasukan, setTanggalPemasukan] = useState(new Date());

  const searchParams = useSearchParams();
  const selectedMonth = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const selectedYear = Number(searchParams.get("year")) || new Date().getFullYear();

  const { user } = useUser();

  const onCreateIncome = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("User belum login.");
      return;
    }

    try {
      const result = await db.insert(Pemasukan).values({
        sumber: sumber,
        jumlah,
        tanggal: tanggalPemasukan,
        createdBy: user.primaryEmailAddress.emailAddress,
      });

      if (result) {
        if (refreshData) refreshData();
        toast.success("Pemasukan berhasil ditambahkan!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menambahkan pemasukan.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-300 ease-in-out">
          + Tambah Pemasukan
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Tambah Pemasukan Baru</DialogTitle>
          <DialogDescription />

          <div className="mt-5 text-left space-y-4">
            <div>
              <h2 className="text-black font-medium">Sumber Pemasukan</h2>
              <Input
                placeholder="contoh: Gaji Freelance"
                onChange={(e) => setSumber(e.target.value)}
              />
            </div>

            <div>
              <h2 className="text-black font-medium">Jumlah</h2>
              <Input
                type="number"
                placeholder="contoh: 1000000"
                onChange={(e) => setJumlah(e.target.value)}
              />
              {jumlah && (
                <p className="text-sm text-muted-foreground mt-1">
                  Format:{" "}
                  <span className="font-medium text-black">
                    Rp {formatRupiah(jumlah)}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="text-center block text-sm font-medium text-black mb-1">
                Tanggal Pemasukan
              </label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={tanggalPemasukan}
                  onSelect={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      setTanggalPemasukan(date);
                    }
                  }}
                />
              </div>
            </div>

            <DialogClose asChild>
              <Button
                disabled={!(sumber && jumlah && tanggalPemasukan)}
                onClick={onCreateIncome}
                className="w-full px-4 py-2 rounded text-white bg-gradient-to-t from-[#2FB98D] to-[#127C71] hover:brightness-105 hover:shadow-lg transition-all duration-450 ease-in-out mt-3"
              >
                Simpan Pemasukan
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CreateIncome;
