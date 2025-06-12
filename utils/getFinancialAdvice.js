import OpenAI from 'openai'

// utils/getFinancialAdvice.js
export default async function getFinancialAdvice(totalDana, totalPengeluaran) {
  try {
    const response = await fetch("/api/advice", {
      method: "POST",
      body: JSON.stringify({ totalDana, totalPengeluaran }),
    });

    const data = await response.json();
    return data.advice;
  } catch (error) {
    console.error("Gagal ambil saran:", error);
    return "Tidak bisa ambil saran saat ini 😓";
  }
}
