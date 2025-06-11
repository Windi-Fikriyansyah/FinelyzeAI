ALTER TABLE "anggaran" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "anggaran" CASCADE;--> statement-breakpoint
ALTER TABLE "pengeluaran" DROP CONSTRAINT "pengeluaran_anggaranId_anggaran_id_fk";
--> statement-breakpoint
ALTER TABLE "pengeluaran" ADD COLUMN "danaId" integer;--> statement-breakpoint
ALTER TABLE "pengeluaran" ADD CONSTRAINT "pengeluaran_danaId_dana_id_fk" FOREIGN KEY ("danaId") REFERENCES "public"."dana"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengeluaran" DROP COLUMN "anggaranId";