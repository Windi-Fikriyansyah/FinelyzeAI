CREATE TABLE "riwayat_tabungan" (
	"id" serial PRIMARY KEY NOT NULL,
	"tabunganId" integer NOT NULL,
	"nominal" numeric NOT NULL,
	"tanggal" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "riwayat_tabungan" ADD CONSTRAINT "riwayat_tabungan_tabunganId_tabungan_id_fk" FOREIGN KEY ("tabunganId") REFERENCES "public"."tabungan"("id") ON DELETE cascade ON UPDATE no action;