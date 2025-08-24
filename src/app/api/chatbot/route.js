import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { db } from "utils/dbConfig";
import { Dana, Pemasukan, Pengeluaran, Tabungan } from "utils/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import OpenAI from "openai";
import dayjs from "dayjs";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await clerkClient.users.getUser(userId);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!userEmail)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { messages = [], month, year } = body;
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const personalFinanceKeywords = [
      "pengeluaran",
      "pemasukan",
      "tabungan",
      "budget",
      "keuangan",
      "uang",
      "investasi",
    ];
    const isPersonalFinance = personalFinanceKeywords.some((keyword) =>
      lastUserMessage.toLowerCase().includes(keyword)
    );

    let systemPrompt = "";

    if (isPersonalFinance) {
      const selectedMonth = month || dayjs().format("MM");
      const selectedYear = year || dayjs().format("YYYY");
      const startDate = dayjs(`${selectedYear}-${selectedMonth}-01`)
        .startOf("month")
        .toDate();
      const endDate = dayjs(startDate).endOf("month").toDate();
      const currentMonthLabel = `${selectedYear}-${selectedMonth}`;

      const danaList = await db
        .select()
        .from(Dana)
        .where(eq(Dana.createdBy, userEmail));

      const pengeluaranList = await db
        .select({
          id: Pengeluaran.id,
          kategori: Pengeluaran.nama,
          jumlah: Pengeluaran.jumlah,
        })
        .from(Pengeluaran)
        .innerJoin(Dana, eq(Pengeluaran.danaId, Dana.id))
        .where(
          and(
            eq(Dana.createdBy, userEmail),
            gte(Pengeluaran.createdAt, startDate),
            lte(Pengeluaran.createdAt, endDate)
          )
        );

      const pemasukanList = await db
        .select()
        .from(Pemasukan)
        .where(
          and(
            eq(Pemasukan.createdBy, userEmail),
            gte(Pemasukan.tanggal, startDate),
            lte(Pemasukan.tanggal, endDate)
          )
        );

      const tabunganList = await db
        .select()
        .from(Tabungan)
        .where(eq(Tabungan.createdBy, userEmail));

      const parseAmount = (val) => Number(String(val).replace(/[^0-9.]/g, ""));
      const totalPemasukan = pemasukanList.reduce(
        (acc, p) => acc + parseAmount(p.jumlah),
        0
      );
      const totalPengeluaran = pengeluaranList.reduce(
        (acc, p) => acc + parseAmount(p.jumlah),
        0
      );

      let statusKeuangan = "Stabil";
      const ratio = totalPengeluaran / (totalPemasukan || 1);
      if (ratio >= 0.7) statusKeuangan = "Boros";
      else if (ratio < 0.3) statusKeuangan = "Hemat";

      const kategoriTotals = {};
      pengeluaranList.forEach((p) => {
        const kategori = p.kategori || "Lain-lain";
        const jumlah = parseAmount(p.jumlah);
        if (!kategoriTotals[kategori]) kategoriTotals[kategori] = 0;
        kategoriTotals[kategori] += jumlah;
      });

      const sortedKategori = Object.entries(kategoriTotals)
        .map(([nama, total]) => ({ nama, total }))
        .sort((a, b) => b.total - a.total);

      const kategoriTerbesar = sortedKategori[0]
        ? `${sortedKategori[0].nama} sebesar Rp ${sortedKategori[0].total.toLocaleString(
            "id-ID"
          )}`
        : "Tidak ada";

      systemPrompt = `
Kamu adalah FinBot, asisten keuangan pribadi yang ramah, sopan, faktual.
Jawaban maksimal 5 kalimat, tanpa simbol dekoratif atau tanda kurung.
Fokus pada status keuangan (Hemat/Stabil/Boros) dan kategori pengeluaran aktual.

Data bulan ${currentMonthLabel}:
- Total pemasukan: Rp ${totalPemasukan.toLocaleString("id-ID")}
- Total pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}
- Status keuangan: ${statusKeuangan}
- Kategori pengeluaran terbesar: ${kategoriTerbesar}
- Tabungan: ${tabunganList
   .map(
     (t) =>
       `${t.nama} Terkumpul Rp ${Number(t.terkumpul).toLocaleString(
         "id-ID"
       )} dari Rp ${Number(t.target).toLocaleString("id-ID")}`
   )
   .join(", ") || "Tidak ada"}

Instruksi:
- Jawaban harus menyertakan status keuangan berdasarkan rasio pengeluaran/pemasukan.
- Sebutkan kategori pengeluaran terbesar dengan nominal yang benar.
- Berikan insight realistis untuk mengelola pengeluaran tersebut.
- Jawaban harus langsung dimulai tanpa simbol atau kata tambahan.
- Abaikan sisa percakapan sebelumnya.
`;
    } else {
      systemPrompt = `
Kamu adalah FinBot, asisten literasi keuangan pribadi yang ramah dan sopan.
Jawaban maksimal 5 kalimat. Gunakan bahasa sederhana, langsung, tanpa simbol dekoratif, tanda baca yang berlebihan.
Berikan jawaban praktis dan mudah dipahami sesuai pertanyaan pengguna.
Fokus jawaban pada inti informasi dan insight, tidak perlu panjang lebar.
`;
    }

    async function getCompletion(model) {
      return await openai.chat.completions.create({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      });
    }

    let completion;
    try {
      completion = await getCompletion("google/gemma-3-27b-it:free");
    } catch (err) {
      try {
        completion = await getCompletion("moonshotai/kimi-k2:free");
      } catch (fallbackErr) {
        const statusCode =
          fallbackErr.status || fallbackErr.response?.status || fallbackErr.code;
        if (statusCode === 429) {
          return NextResponse.json({
            reply: {
              role: "assistant",
              content:
                "Maaf, kuota penggunaan AI hari ini sudah habis. Silakan coba lagi besok.",
            },
          });
        }
        return NextResponse.json(
          { error: "Gagal memproses respons AI" },
          { status: 500 }
        );
      }
    }

    const reply = completion.choices?.[0]?.message;
    if (!reply?.content) {
      return NextResponse.json({
        reply: {
          role: "assistant",
          content:
            "Maaf, aku belum bisa membalas pertanyaanmu. Coba ulangi atau perjelas ya.",
        },
      });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("💥 API chatbot error:", err);
    return NextResponse.json({ error: "Gagal memproses respons AI" }, { status: 500 });
  }
}
