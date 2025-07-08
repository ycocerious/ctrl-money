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
export const trips = pgTable("trips", {
  id: commonIdSchema("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  budget: integer("budget"),
  userId: varchar("user_id").notNull(),
});

export const tripExpenses = pgTable(
  "trip_expenses",
  {
    id: commonIdSchema("id").primaryKey(),
    amount: integer("amount").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: text("category_id")
      .notNull()
      .references(() => spendCategories.id),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id),
    date: date("date").notNull(),
    userId: varchar("user_id").notNull(),
  },
  (table) => [index("trip_expense_dateIndex").on(table.date)],
);

//relations
export const tripRelations = relations(trips, ({ many }) => ({
  expenses: many(tripExpenses),