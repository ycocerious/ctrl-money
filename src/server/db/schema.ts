import { relations } from "drizzle-orm";
import { date, integer, pgTable, text } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const commonIdSchema = (columnName: string) =>
  text(columnName)
    .notNull()
    .$defaultFn(() => nanoid());

//tables
export const income = pgTable("income", {
  id: commonIdSchema("id").primaryKey(),
  amount: integer("amount").notNull(),
  sourceId: text("source_id")
    .notNull()
    .references(() => incomeSources.id),
  date: date("date").notNull(),
});

export const incomeSources = pgTable("income_sources", {
  id: commonIdSchema("id").primaryKey(),
  name: text("name").notNull(),
  date: date("date").notNull(),
});

//relations
export const incomeRelations = relations(income, ({ one }) => ({
  source: one(incomeSources, {
    fields: [income.sourceId],
    references: [incomeSources.id],
  }),
}));

//types
export type IncomeSelect = typeof income.$inferSelect;
export type IncomeInsert = typeof income.$inferInsert;

export type IncomeSourceSelect = typeof incomeSources.$inferSelect;
export type IncomeSourceInsert = typeof incomeSources.$inferInsert;
