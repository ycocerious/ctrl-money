import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { spend, spendCategories } from "~/server/db/schema";

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
        .from(spend)
        .where(
          sql`DATE_TRUNC('month', ${spend.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        )
        .orderBy(spend.date);
    }),

  getSpendStatementsForSpecificCategoryAndMonth: publicProcedure
    .input(z.object({ categoryId: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      const { categoryId, date } = input;
      return db
        .select()
        .from(spend)
        .where(
          and(
            eq(spend.categoryId, categoryId),
            sql`DATE_TRUNC('month', ${spend.date}::date) = DATE_TRUNC('month', ${date}::date)`,
          ),
        )
        .orderBy(desc(spend.date));
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
          totalAmount: sql<number>`sum(${spend.amount})`,
        })
        .from(spend)
        .where(
          sql`DATE_TRUNC('month', ${spend.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalSpendForAllCategories: publicProcedure.query(async () => {
    const stats = await db
      .select({
        categoryId: spend.categoryId,
        totalAmount: sql<number>`sum(${spend.amount})`,
      })
      .from(spend)
      .groupBy(spend.categoryId);

    return stats;
  }),

  addSpend: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        categoryId: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { amount, categoryId, date } = input;

      await db.insert(spend).values({
        date,
        amount,
        categoryId,
      });
    }),

  editSpend: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        categoryId: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, amount, categoryId, date } = input;

      await db
        .update(spend)
        .set({ amount, categoryId, date })
        .where(eq(spend.id, id));
    }),

  deleteSpend: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(spend).where(eq(spend.id, id));
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

      await db.delete(spend).where(eq(spend.categoryId, id));
      await db.delete(spendCategories).where(eq(spendCategories.id, id));
    }),
});
