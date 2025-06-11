import {
    integer, numeric, pgTable, serial, varchar
} from 'drizzle-orm/pg-core'

// schema dana
export const Dana = pgTable("dana", {
  id: serial("id").primaryKey(),
  nama: varchar("nama").notNull(),
  jumlah: varchar("jumlah").notNull(),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull()
})

// schema pengeluaran
export const Pengeluaran = pgTable("pengeluaran", {
    id: serial("id").primaryKey(),
    nama: varchar("nama").notNull(),
    jumlah: numeric("jumlah").notNull().default(0),
    danaId: integer("danaId").references(() => Dana.id),
    createdAt: varchar("createdAt").notNull()
})