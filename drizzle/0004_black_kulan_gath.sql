CREATE TABLE "tabungan" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar NOT NULL,
	"target" numeric DEFAULT 0 NOT NULL,
	"terkumpul" numeric DEFAULT 0 NOT NULL,
	"icon" varchar,
	"createdBy" varchar NOT NULL,
	"createdAt" "cal::local_datetime" NOT NULL
);
