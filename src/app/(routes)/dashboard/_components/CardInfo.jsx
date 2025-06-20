import { PiggyBank, Receipt, Sparkles, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { formatRupiah } from 'utils/formatter';
import getFinancialAdvice from 'utils/getFinancialAdvice';

function CardInfo({ budgetList }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    if (budgetList && budgetList.length > 0) {
      calculateCardInfo();
      fetchAdvice();
    }
  }, [budgetList]);

  const calculateCardInfo = () => {
    let totalBudget_ = 0;
    let totalSpend_ = 0;

    budgetList.forEach((item) => {
      totalBudget_ += Number(item.jumlah);
      totalSpend_ += Number(item.totalSpend);
    });

    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
  };

  const fetchAdvice = async () => {
    const totalBudget_ = budgetList.reduce((acc, item) => acc + Number(item.jumlah), 0);
    const totalSpend_ = budgetList.reduce((acc, item) => acc + Number(item.totalSpend), 0);

    const pengeluaranPerKategori = {};
    budgetList.forEach((item) => {
      const kategori = item.nama || "Lainnya";
      const jumlah = Number(item.totalSpend) || 0;
      if (pengeluaranPerKategori[kategori]) {
        pengeluaranPerKategori[kategori] += jumlah;
      } else {
        pengeluaranPerKategori[kategori] = jumlah;
      }
    });

    const adviceResponse = await getFinancialAdvice(totalBudget_, totalSpend_, pengeluaranPerKategori);
    setAdvice(adviceResponse);
  };

  return (
  <>
    {/* AI Advice Card */}
    <div className='p-7 border mt-4 rounded-2xl flex items-center justify-between bg-gradient-to-r from-blue-50 to-white shadow'>
      <div>
        <div className='flex mb-2 space-x-2 items-center'>
          <h2 className='text-lg font-semibold text-gray-800'>Finelyze AI</h2>
          <Sparkles className='rounded-full text-white w-8 h-8 p-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse' />
        </div>
        <p className='text-sm text-gray-700'>
          {budgetList?.length > 0
            ? `💡 ${advice || "Menganalisis keuanganmu..."}`
            : `💡 Belum ada budgeting bulan ini`}
        </p>
      </div>
    </div>

    {/* Summary Cards */}
    <div className='mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
      <div className='p-7 border rounded-lg flex items-center justify-between shadow-sm'>
        <div>
          <h2 className='text-sm text-gray-600'>Total Dana</h2>
          <h2 className='font-bold text-2xl text-gray-900'>
            Rp {budgetList?.length > 0 ? formatRupiah(totalBudget) : "0"}
          </h2>
        </div>
        <PiggyBank className='bg-primary p-3 h-12 w-12 rounded-full text-white' />
      </div>

      <div className='p-7 border rounded-lg flex items-center justify-between shadow-sm'>
        <div>
          <h2 className='text-sm text-gray-600'>Total Pengeluaran</h2>
          <h2 className='font-bold text-2xl text-gray-900'>
            Rp {budgetList?.length > 0 ? formatRupiah(totalSpend) : "0"}
          </h2>
        </div>
        <Receipt className='bg-primary p-3 h-12 w-12 rounded-full text-white' />
      </div>

      <div className='p-7 border rounded-lg flex items-center justify-between shadow-sm'>
        <div>
          <h2 className='text-sm text-gray-600'>Jumlah Kategori</h2>
          <h2 className='font-bold text-2xl text-gray-900'>
            {budgetList?.length > 0 ? budgetList.length : "0"}
          </h2>
        </div>
        <Wallet className='bg-primary p-3 h-12 w-12 rounded-full text-white' />
      </div>
    </div>
  </>
);

}

export default CardInfo;
