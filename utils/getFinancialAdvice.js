import OpenAI from 'openai'

// utils/getFinancialAdvice.js
export default async function getFinancialAdvice(totalDana, totalPengeluaran, totalPemasukan, kategoriList) {
  try {
    const response = await fetch("/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalDana, totalPengeluaran, totalPemasukan, kategoriList }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response not OK:", errorText);
      return "Gagal ambil saran saat ini 😓";
    }

    const data = await response.json();
    return data.advice;
  } catch (error) {
    console.error("Gagal ambil saran:", error);
    return "Tidak bisa ambil saran saat ini 😓";
  }
}
