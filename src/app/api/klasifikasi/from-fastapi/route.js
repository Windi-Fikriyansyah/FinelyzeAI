import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user");

  if (!userId) {
    return NextResponse.json({ error: "Parameter 'user' diperlukan." }, { status: 400 });
  }

  try {
    // Ambil data pengeluaran siap klasifikasi
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/expenses/for-ml?user=${userId}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Data bukan array", raw: data }, { status: 500 });
    }

    // Format data sesuai FastAPI
    const formatted = data.map(item => ({
      bulan: item.bulan,
      total_pengeluaran: parseFloat(item.jumlah),
    }));

    // Kirim POST ke FastAPI
    const klasifikasiRes = await fetch("http://localhost:8000/klasifikasi/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: formatted }),
    });

    if (!klasifikasiRes.ok) {
      throw new Error("Klasifikasi server error");
    }

    const hasil = await klasifikasiRes.json();
    return NextResponse.json(hasil);
  } catch (error) {
    console.error("Gagal menghubungkan ke klasifikasi server:", error);
    return NextResponse.json({ error: "Gagal menghubungkan ke klasifikasi server." }, { status: 500 });
  }
}
