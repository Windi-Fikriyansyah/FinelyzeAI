CREATE TABLE "anggaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar NOT NULL,
	"jumlah" varchar NOT NULL,
	"icon" varchar,
	"createdBy" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dana" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar NOT NULL,
	"jumlah" varchar NOT NULL,
	"icon" varchar,
	"createdBy" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengeluaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar NOT NULL,
	"jumlah" numeric DEFAULT 0 NOT NULL,
	"anggaranId" integer,
	"createdAt" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pengeluaran" ADD CONSTRAINT "pengeluaran_anggaranId_anggaran_id_fk" FOREIGN KEY ("anggaranId") REFERENCES "public"."anggaran"("id") ON DELETE no action ON UPDATE no action;