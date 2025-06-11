export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID').format(Number(angka));
}

export function formatRupiahWithSymbol(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(angka));
}