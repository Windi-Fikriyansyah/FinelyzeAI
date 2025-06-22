import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "utils/dbConfig";
import {
  Dana,
  Pemasukan,
  Pengeluaran,
  Tabungan,
  RiwayatTabungan,
} from "utils/schema";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import OpenAI from "openai";
import dayjs from "dayjs";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("🚫 Tidak ada userId - mungkin belum login?");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;
console.log("🧑‍💻 userId Clerk:", userId);

const now = dayjs();
const currentMonth = now.format("YYYY-MM"); 

const danaList = await db
  .select()
  .from(Dana)
  .where(and(eq(Dana.createdBy, userId), eq(Dana.bulan, currentMonth)));

console.log("🎯 CurrentMonth digunakan:", currentMonth);
console.log("📦 DanaList:", danaList);

    const dana = danaList[0]; // Ambil satu dana utama
    const danaIds = danaList.map((d) => d.id); // Buat list ID dana user

    // Ambil pengeluaran berdasarkan dana user
const pengeluaran = await db
  .select({
    id: Pengeluaran.id,
    nama: Pengeluaran.nama,
    jumlah: Pengeluaran.jumlah,
    createdAt: Pengeluaran.createdAt,
  })
  .from(Pengeluaran)
  .innerJoin(Dana, eq(Pengeluaran.danaId, Dana.id))
  .where(
    and(
      eq(Dana.createdBy, userId),
      eq(Dana.bulan, currentMonth),
      gte(Pengeluaran.createdAt, now.startOf("month").toDate()),
      lte(Pengeluaran.createdAt, now.endOf("month").toDate())
    )
  );

    const pemasukan = await db
      .select()
      .from(Pemasukan)
      .where(eq(Pemasukan.createdBy, userId));

    const tabungan = await db
      .select()
      .from(Tabungan)
      .where(eq(Tabungan.createdBy, userId));

    const riwayatTabungan = await db
      .select({
        nominal: RiwayatTabungan.nominal,
        tanggal: RiwayatTabungan.tanggal,
      })
      .from(RiwayatTabungan)
      .innerJoin(Tabungan, eq(RiwayatTabungan.tabunganId, Tabungan.id))
      .where(
        and(
          eq(Tabungan.createdBy, userId),
          gte(RiwayatTabungan.tanggal, now.startOf("month").toDate()),
          lte(RiwayatTabungan.tanggal, now.endOf("month").toDate())
        )
      );

    // Normalisasi data
    const pengeluaranList = pengeluaran || [];
    const pemasukanList = pemasukan || [];
    const tabunganList = tabungan || [];
    const riwayatList = riwayatTabungan || [];

    console.log("🧾 PengeluaranList:", pengeluaranList);
console.log("🧾 PemasukanList:", pemasukanList);
console.log("🧾 Dana:", dana);

    // Prompt sistem untuk Finbot
    const systemPrompt = `
Kamu adalah Finbot 🤖, asisten keuangan digital yang ceria, cerdas, dan jujur. Tugasmu adalah membantu user memahami kondisi keuangannya berdasarkan data aktual bulan ini.

Data user bulan ini:
- Dana: Rp ${Number(dana?.jumlah || 0)}
- Total pemasukan: Rp ${pemasukanList.reduce((acc, p) => acc + Number(p.jumlah), 0)}
- Total pengeluaran: Rp ${pengeluaranList.reduce((acc, p) => acc + Number(p.jumlah), 0)}
- Pengeluaran per kategori:
${pengeluaranList.length > 0
  ? pengeluaranList.map((p) => `  - ${p.nama}: Rp ${Number(p.jumlah)}`).join("\n")
  : "  - Tidak ada"}
- Tabungan aktif:
${tabunganList.length > 0
  ? tabunganList.map((t) => `  - ${t.nama}: Terkumpul Rp ${Number(t.terkumpul)} dari Rp ${Number(t.target)}`).join("\n")
  : "  - Tidak ada"}
- Riwayat Nabung bulan ini:
${riwayatList.length > 0
  ? riwayatList.map((r) => `  - Rp ${Number(r.nominal)} pada ${dayjs(r.tanggal).format("DD MMM")}`).join("\n")
  : "  - Tidak ada"}

Gaya bicaramu:
- Ramah, lucu, penuh semangat, dan memotivasi.
- Analisa tajam tapi tetap menyenangkan.
- Klasifikasikan topik keuangan user ke Primer, Sekunder, atau Tersier jika cocok.
- Akhiri jawaban dengan pertanyaan relevan agar user terus ingin ngobrol.
`.trim();

    // Kirim ke OpenRouter
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const reply = completion.choices?.[0]?.message;

    if (!reply?.content) {
      return NextResponse.json({
        reply: {
          role: "assistant",
          content:
            "Maaf, aku belum bisa membalas pertanyaanmu. Coba ulangi atau perjelas ya 😊",
        },
      });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("💥 API chatbot error:", err);
    return NextResponse.json(
      { error: "Gagal memproses respons AI" },
      { status: 500 }
    );
  }
}
