import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const commonIdSchema = (columnName: string) =>
  text(columnName)
    .notNull()
    .$defaultFn(() => nanoid());

//tables
export const incomes = pgTable(
  "incomes",
  {
    id: commonIdSchema("id").primaryKey(),
    amount: integer("amount").notNull(),
    sourceId: text("source_id")
      .notNull()
      .references(() => incomeSources.id),
    date: date("date").notNull(),
    userId: varchar("user_id").notNull(),
  },
  (table) => [index("income_dateIndex").on(table.date)],
);

export const incomeSources = pgTable("income_sources", {
  id: commonIdSchema("id").primaryKey(),
  name: text("name").notNull(),
  userId: varchar("user_id").notNull(),
});

export const spends = pgTable(
  "spends",
  {
    id: commonIdSchema("id").primaryKey(),
    amount: integer("amount").notNull(),
    name: text("name").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => spendCategories.id),
    date: date("date").notNull(),
    userId: varchar("user_id").notNull(),
  },
  (table) => [index("spend_dateIndex").on(table.date)],
);

export const spendCategories = pgTable("spend_categories", {
  id: commonIdSchema("id").primaryKey(),
  name: text("name").notNull(),
  userId: varchar("user_id").notNull(),
});

export const receivables = pgTable("receivables", {
  id: commonIdSchema("id").primaryKey(),
  amount: integer("amount").notNull(),
  name: text("name").notNull(),
  purpose: text("purpose").notNull(),
  date: date("date").notNull(),
  userId: varchar("user_id").notNull(),
});

//relations
export const incomeRelations = relations(incomes, ({ one }) => ({
  source: one(incomeSources, {
    fields: [incomes.sourceId],
    references: [incomeSources.id],
  }),
}));

export const spendRelations = relations(spends, ({ one }) => ({
  category: one(spendCategories, {
    fields: [spends.categoryId],
    references: [spendCategories.id],
  }),
}));

//types
export type IncomeSelect = typeof incomes.$inferSelect;
export type IncomeInsert = typeof incomes.$inferInsert;

export type IncomeSourceSelect = typeof incomeSources.$inferSelect;
export type IncomeSourceInsert = typeof incomeSources.$inferInsert;

export type SpendSelect = typeof spends.$inferSelect;
export type SpendInsert = typeof spends.$inferInsert;

export type SpendCategorySelect = typeof spendCategories.$inferSelect;
export type SpendCategoryInsert = typeof spendCategories.$inferInsert;

export type ReceivableSelect = typeof receivables.$inferSelect;
export type ReceivableInsert = typeof receivables.$inferInsert;
