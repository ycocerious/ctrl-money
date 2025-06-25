import { relations } from "drizzle-orm";
import { date, index, integer, pgTable, text } from "drizzle-orm/pg-core";
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
  },
  (table) => ({
    dateIndex: index("income_dateIndex").on(table.date),
  }),
);

export const incomeSources = pgTable("income_sources", {
  id: commonIdSchema("id").primaryKey(),
  name: text("name").notNull(),
});

export const spends = pgTable(
  "spends",
  {
    id: commonIdSchema("id").primaryKey(),
    amount: integer("amount").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => spendCategories.id),
    date: date("date").notNull(),
  },
  (table) => ({
    dateIndex: index("spend_dateIndex").on(table.date),
  }),
);

export const spendCategories = pgTable("spend_categories", {
  id: commonIdSchema("id").primaryKey(),
  name: text("name").notNull(),
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
