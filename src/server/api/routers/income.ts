// server/api/routers/income.ts
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { income, incomeSources } from "~/server/db/schema";

export const incomeRouter = createTRPCRouter({
  getIncomeSources: publicProcedure.query(async () => {
    return db.select().from(incomeSources).orderBy(incomeSources.name);
  }),

  getIncomes: publicProcedure.query(async () => {
    return db.select().from(income).orderBy(income.addedAt);
  }),

  getIncomeSourceStats: publicProcedure.query(async () => {
    const stats = await db
      .select({
        sourceId: income.sourceId,
        totalAmount: sql<number>`sum(${income.amount})`,
      })
      .from(income)
      .groupBy(income.sourceId);

    return stats;
  }),

  addIncome: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        sourceId: z.string(),
        addedAt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { amount, sourceId, addedAt } = input;

      await db.insert(income).values({
        addedAt,
        amount,
        sourceId,
      });
    }),

  editIncome: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        sourceId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, amount, sourceId } = input;

      await db
        .update(income)
        .set({ amount, sourceId })
        .where(eq(income.id, id));
    }),

  deleteIncome: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(income).where(eq(income.id, id));
    }),

  addIncomeSource: publicProcedure
    .input(z.object({ name: z.string(), addedAt: z.string() }))
    .mutation(async ({ input }) => {
      const { name, addedAt } = input;

      await db.insert(incomeSources).values({
        addedAt,
        name,
      });
    }),

  editIncomeSource: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const { id, name } = input;

      await db
        .update(incomeSources)
        .set({ name })
        .where(eq(incomeSources.id, id));
    }),

  deleteIncomeSource: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(income).where(eq(income.sourceId, id));
      await db.delete(incomeSources).where(eq(incomeSources.id, id));
    }),
});
