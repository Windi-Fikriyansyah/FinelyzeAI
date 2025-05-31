import {
    integer, numeric, pgTable, serial, varchar
} from 'drizzle-orm/pg-core'

// schema anggaran
export const Anggaran = pgTable("anggaran", {
    id: serial("id").primaryKey(),
    nama: varchar("nama").notNull(),
    jumlah: varchar("jumlah").notNull(),
    icon: varchar("icon"),
    createdBy: varchar("createdBy").notNull()
})

// schema pendapatan
export const Pendapatan = pgTable("pendapatan", {
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
    jumlah: varchar("jumlah").notNull(),
    budgetId: integer("budgetId").references(() => Anggaran.id),
    createdBy: varchar("createdBy").notNull()
})
