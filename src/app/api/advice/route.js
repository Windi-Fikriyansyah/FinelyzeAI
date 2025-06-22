import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { totalDana, totalPengeluaran, totalPemasukan, kategoriList } = body;

    console.log("API Advice received:", body);

    const prompt = `
    Kamu adalah Finelyze AI, asisten keuangan digital yang ramah, pintar, dan kritis dalam menganalisis kebiasaan pengguna. Tugasmu adalah memberikan insight berdasarkan data aktual yang sudah terjadi, bukan menyuruh pengguna mengubah hal yang sudah lewat. Sistem ini bekerja berdasarkan pelacakan (tracking), jadi analisis dan saranmu harus fokus pada refleksi dan pembelajaran untuk ke depan.

    Data pengguna bulan ini:
    - Total Dana: Rp ${totalDana}
    - Pemasukan: Rp ${totalPemasukan}
    - Pengeluaran: Rp ${totalPengeluaran}
    - Rincian pengeluaran per kategori:
    ${kategoriList.map((item) => `- ${item.nama}: Rp ${item.total}`).join("\n")}

    Tugasmu:
    Buat **1 paragraf (maksimal 4 kalimat)** yang menjelaskan:
    1. Kondisi keuangan pengguna secara umum.
    2. Masalah utama dan kenapa itu penting.
    3. Analisis mendalam (contoh: terlalu sering beli kopi, make up mahal, dll).
    4. Saran yang ringan tapi berbobot, bisa langsung dilakukan, dan membuka wawasan.

    Gaya bahasa:
    - Ramah, santai, tapi tetap cerdas dan insightful.
    - Hindari kesan kaku dan terlalu baku.
    - Tunjukkan insight yang membuat user paham **mengapa itu penting**.
    - Boleh menyebut angka jika penting untuk user ketahui (misalnya: “pengeluaran Nongkrong di Cafe Rp 300.000 terlalu tinggi…”).
    - Hindari frasa ambigu (contoh: “sepertinya”, “mungkin”, dll).
    - Jangan gunakan bullet, angka, atau format list.

    Contoh gaya bahasa:
    "Keuanganmu bulan ini agak ketat karena pengeluaran lebih besar dari pemasukan. Pengeluaran untuk Nongkrong di Cafe mencapai Rp 300.000, yang cukup besar jika dilihat sebagai kebiasaan mingguan. Coba batasi jadi dua kali seminggu, supaya lebih banyak ruang untuk kebutuhan lain. Yuk, mulai rancang budgeting yang lebih realistis dan sesuai prioritas!"
    atau
    "Keuanganmu bulan ini mengalami defisit karena pengeluaran melebihi pemasukan, terutama untuk persiapan wisuda yang memang cukup besar dan bisa dimaklumi. Tapi pengeluaran lain seperti membeli make up dan nongkrong di Cafe juga cukup konsisten setiap minggu, dan itu bisa mempengaruhi fleksibilitas dana harian. Dari pola ini, kamu bisa mulai mempertimbangkan batasan rutin atau alokasi bulanan yang tetap untuk kategori non-esensial. Dengan begitu, kamu tetap bisa menikmati hal-hal kecil tanpa mengganggu stabilitas keuangan bulan depan."

    Jawabanmu hanya berisi isi paragraf tersebut. Tidak perlu pengantar atau penutup.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return new Response(
      JSON.stringify({ advice: completion.choices[0].message.content }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      return new Response(
        JSON.stringify({
          advice: "Gagal mengambil saran dari AI 😓",
          debug: error.message || error.toString()
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
}
