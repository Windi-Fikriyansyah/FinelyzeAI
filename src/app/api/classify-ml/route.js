import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  try {
    const res = await fetch("http://localhost:8000/klasifikasi/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_pengeluaran: body.total_pengeluaran })
    });

    const hasil = await res.json();
    return NextResponse.json(hasil);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Gagal menghubungi model ML" }, { status: 500 });
  }
}
