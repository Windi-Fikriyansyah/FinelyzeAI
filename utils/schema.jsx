import { pgTable } from "drizzle-orm/pg-core";

export const Budgets=pgTable('anggaran',{
    id:serial('id').primaryKey(),
    name:varchar('nama').notNull(),
    amount:varchar('jumlah').notNull(),
    icon: varchar('icon'),
    createdBy:varchar('createdBy').notNull()
})