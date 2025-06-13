ALTER TABLE "dana" ALTER COLUMN "jumlah" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "pengeluaran" ALTER COLUMN "createdAt" SET DATA TYPE "undefined"."cal::local_datetime";--> statement-breakpoint
ALTER TABLE "dana" DROP COLUMN "kategori";