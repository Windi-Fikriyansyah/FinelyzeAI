'use client'
import React,{useState, useEffect} from 'react'
import{ UserButton, useUser } from "@clerk/nextjs";

function Dashboard() {
  const { user } = useUser();
  return (
    <div className='p-8'>
      <h2 className="font-bold text-4xl"> Hi, {user?.fullName} </h2>
      <p className="text-gray-500">Ini dia ringkasan keuanganmu. Yuk, cek dan kelola!</p>
    </div> 
    );
}

export default Dashboard;