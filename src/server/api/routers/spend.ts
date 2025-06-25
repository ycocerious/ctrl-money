import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { spendCategories, spends } from "~/server/db/schema";

export const spendRouter = createTRPCRouter({
  getSpendCategories: publicProcedure.query(async () => {
    return db.select().from(spendCategories).orderBy(spendCategories.name);
  }),

  getSpendStatementsForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      return db
        .select()
        .from(spends)
        .where(
          sql`DATE_TRUNC('month', ${spends.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        )
        .orderBy(spends.date);
    }),

  getSpendStatementsForSpecificCategoryAndMonth: publicProcedure
    .input(z.object({ categoryId: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      const { categoryId, date } = input;
      return db
        .select()
        .from(spends)
        .where(
          and(
            eq(spends.categoryId, categoryId),
            sql`DATE_TRUNC('month', ${spends.date}::date) = DATE_TRUNC('month', ${date}::date)`,
          ),
        )
        .orderBy(desc(spends.date));
    }),

  getTotalSpendForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      const result = await db
        .select({
          totalAmount: sql<number>`sum(${spends.amount})`,
        })
        .from(spends)
        .where(
          sql`DATE_TRUNC('month', ${spends.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalSpendForAllCategories: publicProcedure.query(async () => {
    const stats = await db
      .select({
        categoryId: spends.categoryId,
        totalAmount: sql<number>`sum(${spends.amount})`,
      })
      .from(spends)
      .groupBy(spends.categoryId);

    return stats;
  }),

  addSpend: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        categoryId: z.string(),
        date: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { amount, categoryId, date, name } = input;

      await db.insert(spends).values({
        date,
        amount,
        categoryId,
        name,
      });
    }),

  editSpend: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        categoryId: z.string(),
        date: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, amount, categoryId, date, name } = input;

      await db
        .update(spends)
        .set({ amount, categoryId, date, name })
        .where(eq(spends.id, id));
    }),

  deleteSpend: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(spends).where(eq(spends.id, id));
    }),

  addSpendCategory: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const { name } = input;

      await db.insert(spendCategories).values({
        name,
      });
    }),

  editSpendCategory: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const { id, name } = input;

      await db
        .update(spendCategories)
        .set({ name })
        .where(eq(spendCategories.id, id));
    }),

  deleteSpendCategory: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(spends).where(eq(spends.categoryId, id));
      await db.delete(spendCategories).where(eq(spendCategories.id, id));
    }),
});
