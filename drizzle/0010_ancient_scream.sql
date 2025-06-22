CREATE TABLE "pemasukan" (
	"id" serial PRIMARY KEY NOT NULL,
	"sumber" varchar(50) NOT NULL,
	"jumlah" numeric DEFAULT 0 NOT NULL,
	"tanggal" timestamp NOT NULL,
	"createdBy" varchar NOT NULL
);
