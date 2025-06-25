import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { spendCategories, spends } from "~/server/db/schema";

export const spendRouter = createTRPCRouter({
  getSpendCategories: publicProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(spendCategories)
      .where(eq(spendCategories.userId, ctx.userId))
      .orderBy(spendCategories.name);
  }),

  getSpendStatementsForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date } = input;

      return db
        .select()
        .from(spends)
        .where(
          and(
            sql`DATE_TRUNC('month', ${spends.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(spends.userId, ctx.userId),
          ),
        )
        .orderBy(spends.date);
    }),

  getSpendStatementsForSpecificCategoryAndMonth: publicProcedure
    .input(z.object({ categoryId: z.string(), date: z.string() }))
    .query(async ({ input, ctx }) => {
      const { categoryId, date } = input;
      return db
        .select()
        .from(spends)
        .where(
          and(
            eq(spends.categoryId, categoryId),
            sql`DATE_TRUNC('month', ${spends.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(spends.userId, ctx.userId),
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
    .query(async ({ input, ctx }) => {
      const { date } = input;

      const result = await db
        .select({
          totalAmount: sql<number>`sum(${spends.amount})`,
        })
        .from(spends)
        .where(
          and(
            sql`DATE_TRUNC('month', ${spends.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(spends.userId, ctx.userId),
          ),
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalSpendForAllCategories: publicProcedure.query(async ({ ctx }) => {
    const stats = await db
      .select({
        categoryId: spends.categoryId,
        totalAmount: sql<number>`sum(${spends.amount})`,
      })
      .from(spends)
      .where(eq(spends.userId, ctx.userId))
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
    .mutation(async ({ input, ctx }) => {
      const { amount, categoryId, date, name } = input;

      await db.insert(spends).values({
        date,
        amount,
        categoryId,
        name,
        userId: ctx.userId,
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
    .mutation(async ({ input, ctx }) => {
      const { id, amount, categoryId, date, name } = input;

      await db
        .update(spends)
        .set({ amount, categoryId, date, name })
        .where(and(eq(spends.id, id), eq(spends.userId, ctx.userId)));
    }),

  deleteSpend: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await db
        .delete(spends)
        .where(and(eq(spends.id, id), eq(spends.userId, ctx.userId)));
    }),

  addSpendCategory: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      await db.insert(spendCategories).values({
        name,
        userId: ctx.userId,
      });
    }),

  editSpendCategory: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, name } = input;

      await db
        .update(spendCategories)
        .set({ name })
        .where(
          and(
            eq(spendCategories.id, id),
            eq(spendCategories.userId, ctx.userId),
          ),
        );
    }),

  deleteSpendCategory: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await db
        .delete(spends)
        .where(and(eq(spends.categoryId, id), eq(spends.userId, ctx.userId)));
      await db
        .delete(spendCategories)
        .where(
          and(
            eq(spendCategories.id, id),
            eq(spendCategories.userId, ctx.userId),
          ),
        );
    }),
});
