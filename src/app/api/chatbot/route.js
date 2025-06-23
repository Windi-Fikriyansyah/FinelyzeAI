import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ ini yang kamu lupa
import { NextResponse } from "next/server";
import { db } from "utils/dbConfig";
import {
  Dana,
  Pemasukan,
  Pengeluaran,
  Tabungan,
  RiwayatTabungan,
} from "utils/schema";
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
    if (!userId) {
      console.log("🚫 Tidak ada userId - belum login?");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil data user lengkap untuk email
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      console.log("🚫 Gagal ambil email user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📧 userEmail:", userEmail);

    const body = await req.json();
    const { messages } = body;

    const now = dayjs();
    const currentMonth = now.format("YYYY-MM");

    const danaList = await db
      .select()
      .from(Dana)
      .where(and(eq(Dana.createdBy, userEmail), eq(Dana.bulan, currentMonth)));

    const dana = danaList[0];

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
          eq(Dana.createdBy, userEmail),
          eq(Dana.bulan, currentMonth),
          gte(Pengeluaran.createdAt, now.startOf("month").toDate()),
          lte(Pengeluaran.createdAt, now.endOf("month").toDate())
        )
      );

    const pemasukan = await db
      .select()
      .from(Pemasukan)
      .where(eq(Pemasukan.createdBy, userEmail));

    const tabungan = await db
      .select()
      .from(Tabungan)
      .where(eq(Tabungan.createdBy, userEmail));

    const riwayatTabungan = await db
      .select({
        nominal: RiwayatTabungan.nominal,
        tanggal: RiwayatTabungan.tanggal,
      })
      .from(RiwayatTabungan)
      .innerJoin(Tabungan, eq(RiwayatTabungan.tabunganId, Tabungan.id))
      .where(
        and(
          eq(Tabungan.createdBy, userEmail),
          gte(RiwayatTabungan.tanggal, now.startOf("month").toDate()),
          lte(RiwayatTabungan.tanggal, now.endOf("month").toDate())
        )
      );

    // Normalisasi angka
    const parseAmount = (val) => Number(String(val).replace(/[^0-9.]/g, ""));

    const pengeluaranList = pengeluaran || [];
    const pemasukanList = pemasukan || [];
    const tabunganList = tabungan || [];
    const riwayatList = riwayatTabungan || [];

    const totalPemasukan = pemasukanList.reduce(
      (acc, p) => acc + parseAmount(p.jumlah),
      0
    );
    const totalPengeluaran = pengeluaranList.reduce(
      (acc, p) => acc + parseAmount(p.jumlah),
      0
    );

    console.log("🎯 Bulan:", currentMonth);
    console.log("📦 DanaList:", danaList);
    console.log("🧾 PengeluaranList:", pengeluaranList);
    console.log("🧾 PemasukanList:", pemasukanList);

    const systemPrompt = `
Kamu adalah Finbot 🤖, asisten keuangan digital yang ceria, cerdas, dan jujur. Tugasmu adalah membantu user memahami kondisi keuangannya berdasarkan data aktual bulan ini.

📅 Bulan: ${currentMonth}
📥 Total pemasukan: Rp ${totalPemasukan.toLocaleString("id-ID")}
📤 Total pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}

🧾 Rincian Pengeluaran:
${
  pengeluaranList.length > 0
    ? pengeluaranList
        .map(
          (p) =>
            `  - ${p.nama}: Rp ${Number(p.jumlah).toLocaleString("id-ID")}`
        )
        .join("\n")
    : "  - Tidak ada pengeluaran bulan ini."
}

💼 Dana yang dimiliki:
${
  danaList.length > 0
    ? danaList
        .map(
          (d) =>
            `  - ${d.nama}: Rp ${Number(d.jumlah).toLocaleString("id-ID")}`
        )
        .join("\n")
    : "  - Tidak ada dana yang tercatat."
}

💰 Pemasukan:
${
  pemasukanList.length > 0
    ? pemasukanList
        .map(
          (p) =>
            `  - ${p.sumber}: Rp ${Number(p.jumlah).toLocaleString("id-ID")}`
        )
        .join("\n")
    : "  - Tidak ada pemasukan."
}

📦 Tabungan aktif:
${
  tabunganList.length > 0
    ? tabunganList
        .map(
          (t) =>
            `  - ${t.nama}: Terkumpul Rp ${Number(t.terkumpul)} dari Rp ${Number(
              t.target
            )}`
        )
        .join("\n")
    : "  - Tidak ada tabungan."
}

📈 Gaya bicaramu:
- Ceria, analitis, dan membantu user refleksi keuangan bulan ini.
- Beri insight apakah boros, hemat, atau cukup stabil.
- Akhiri dengan pertanyaan agar percakapan berlanjut!
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
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
