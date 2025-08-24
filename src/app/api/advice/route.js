import OpenAI from "openai";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("❌ OPENROUTER_API_KEY tidak ditemukan di environment variables!");
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      totalDana = 0,
      totalPengeluaran = 0,
      totalPemasukan = 0,
      kategoriList = [],
      month,
      year,
    } = body;

    const validatedKategoriList = kategoriList
      .map(item => ({
        nama: item.nama || "Kategori",
        dana: Number(item.dana) || 0,
        total: Number(item.total) || 0,
      }))
      .filter(item => item.total > 0);

    const sisa = totalPemasukan - totalPengeluaran;

    if (
      totalDana === 0 &&
      totalPengeluaran === 0 &&
      totalPemasukan === 0 &&
      validatedKategoriList.length === 0
    ) {
      return new Response(
        JSON.stringify({
          advice: `Belum ada data keuangan pada ${month || "bulan ini"}/${year || ""}. Yuk mulai catat pemasukan dan pengeluaranmu!`
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
      Kamu adalah Finelyze AI, asisten keuangan pribadi yang ramah, kritis dan praktis.  
      Analisis data bulan ${month || "ini"} ${year || ""}.

      Data:
      - Pemasukan: Rp ${totalPemasukan.toLocaleString("id-ID")}
      - Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}
      - Sisa Dana: Rp ${sisa.toLocaleString("id-ID")}
      - Kategori dengan pengeluaran:
      ${validatedKategoriList.map(item => `- ${item.nama}: Dana Rp ${item.dana.toLocaleString("id-ID")}, Pengeluaran Rp ${item.total.toLocaleString("id-ID")}`).join("\n")}

      Instruksi:
      1. Analisis kategori dengan pengeluaran terbesar.
      2. Berikan insight realistis, misal masak sendiri, cari promo, kurangi frekuensi, batasi belanja impulsif.
      3. Jawaban maksimal 4 kalimat, paragraf utuh, sertakan nominal.
      4. Tidak boleh ada simbol dekoratif dan tanda kurung
      `;

    const models = [
      "google/gemma-3-27b-it:free",
      "moonshotai/kimi-k2:free"
    ];

    let completion = null;
    let usedModel = null;

    for (const model of models) {
      try {
        completion = await openai.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
        });
        usedModel = model;
        break;
      } catch (err) {
        if (err.status === 429) {
          return new Response(
            JSON.stringify({
              advice: "⚠️ Kuota harian AI sudah habis. Silakan coba lagi besok ya 😊"
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          );
        }
        console.warn(`Model ${model} gagal, mencoba model berikutnya`, err.message);
      }
    }

    if (!completion) throw new Error("Semua model gagal digunakan.");

    return new Response(
      JSON.stringify({
        modelUsed: usedModel,
        advice: completion.choices[0].message.content
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return new Response(
      JSON.stringify({
        advice: "Terjadi kesalahan pada server. Coba lagi nanti.",
        debug: error.message || error.toString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
