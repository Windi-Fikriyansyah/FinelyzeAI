import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // ganti dengan domain deploy nanti
    "X-Title": "FinelyzeAI",
  },
});

export async function POST(req) {
  try {
    const { totalDana, totalPengeluaran } = await req.json();

    const userPrompt = `
    Berdasarkan data keuangan berikut:
    - Total Dana: Rp ${totalDana}
    - Total Pengeluaran: Rp ${totalPengeluaran}
    Berikan ringkasan kondisi keuangan saya saat ini dan satu saran untuk pengelolaan keuangan saya. Tulis dalam 2 kalimat bahasa Indonesia yang ramah.
    `;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
    });

    return Response.json({
      advice: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return Response.json({ advice: "Gagal mengambil saran dari AI 😓" }, { status: 500 });
  }
}
