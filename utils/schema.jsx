import { timestamp } from 'drizzle-orm/pg-core';
import {
    integer, numeric, pgTable, serial, varchar
} from 'drizzle-orm/pg-core'

// schema dana
export const Dana = pgTable("dana", {
  id: serial("id").primaryKey(),
  nama: varchar("nama").notNull(),
  jumlah: numeric("jumlah").notNull().default(0),
  icon: varchar("icon"),

  bulan: varchar("bulan").notNull(),
  createdBy: varchar("createdBy").notNull() 
})

// schema pengeluaran
export const Pengeluaran = pgTable("pengeluaran", {
    id: serial("id").primaryKey(),
    nama: varchar("nama").notNull(),
    jumlah: numeric("jumlah").notNull().default(0),
    danaId: integer("danaId").references(() => Dana.id),
    createdAt: timestamp("createdAt", { mode: "string" }).notNull()
})

//Schema Tabungan
export const Tabungan = pgTable("tabungan", {
  id: serial("id").primaryKey(),
  nama: varchar("nama").notNull(),
  target: numeric("target").notNull().default(0),
  terkumpul: numeric("terkumpul").notNull().default(0),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  targetDate: timestamp("targetDate", { mode: "date" }).notNull()
})

//Schema Riwayat Tabungan
export const RiwayatTabungan = pgTable("riwayat_tabungan", {
  id: serial("id").primaryKey(),
  tabunganId: integer("tabunganId").notNull().references(() => Tabungan.id, { onDelete: "cascade" }),
  nominal: numeric("nominal").notNull(),
  tanggal: timestamp("tanggal", { mode: "date" }).notNull()
});

//Schema Pemasukan
export const Pemasukan = pgTable("pemasukan", {
  id: serial("id").primaryKey(),
  sumber: varchar("sumber", { length: 50 }).notNull(),
  jumlah: numeric("jumlah").notNull().default(0),
  tanggal: timestamp("tanggal", { mode: "date" }).notNull(),
  createdBy: varchar("createdBy").notNull()
})
