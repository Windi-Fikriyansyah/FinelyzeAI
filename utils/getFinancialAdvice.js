// utils/getFinancialAdvice.js
export default async function getFinancialAdvice(
  totalDana,
  totalPengeluaran,
  totalPemasukan,
  kategoriList
) {
  try {
    const response = await fetch("/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalDana, totalPengeluaran, totalPemasukan, kategoriList }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return "⚠️ Kuota harian AI sudah habis. Silakan coba lagi besok ya 😊";
      }

      const errorText = await response.text();
      console.error("Response not OK:", errorText);
      return "Gagal ambil saran saat ini 😓";
    }

    const data = await response.json();

    if (!data.advice) {
      return "Tidak ada saran tersedia saat ini 😓";
    }

    return data.advice;
  } catch (error) {
    console.error("Gagal ambil saran:", error);
    return "Tidak bisa ambil saran saat ini 😓";
  }
}
