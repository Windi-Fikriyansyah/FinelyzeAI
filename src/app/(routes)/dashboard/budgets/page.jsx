import React from 'react'
import BudgetList from './_components/BudgetList'

function Budget() {
  return (
    <div className='p-10'>
      <h2 className='font-bold text-3xl'>Kategori Dana</h2>
      <p className="text-gray-600">Buat kategori dana sesuai kebutuhanmu. Yuk, mulai atur sekarang!</p>

        <BudgetList/>
    </div>
  )
}

export default Budget
