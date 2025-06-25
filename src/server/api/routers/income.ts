import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { incomes, incomeSources } from "~/server/db/schema";

export const incomeRouter = createTRPCRouter({
  getIncomeSources: publicProcedure.query(async () => {
    return db.select().from(incomeSources).orderBy(incomeSources.name);
  }),

  getIncomeStatementsForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      return db
        .select()
        .from(incomes)
        .where(
          sql`DATE_TRUNC('month', ${incomes.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        )
        .orderBy(incomes.date);
    }),

  getIncomeStatementsForSpecificSource: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .query(async ({ input }) => {
      const { sourceId } = input;
      return db
        .select()
        .from(incomes)
        .where(eq(incomes.sourceId, sourceId))
        .orderBy(desc(incomes.date));
    }),

  getTotalIncomeForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      const result = await db
        .select({
          totalAmount: sql<number>`sum(${incomes.amount})`,
        })
        .from(incomes)
        .where(
          sql`DATE_TRUNC('month', ${incomes.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalIncomeForAllSources: publicProcedure.query(async () => {
    const stats = await db
      .select({
        sourceId: incomes.sourceId,
        totalAmount: sql<number>`sum(${incomes.amount})`,
      })
      .from(incomes)
      .groupBy(incomes.sourceId);

    return stats;
  }),

  addIncome: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        sourceId: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { amount, sourceId, date } = input;

      await db.insert(incomes).values({
        date,
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
        date: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, amount, sourceId, date } = input;

      await db
        .update(incomes)
        .set({ amount, sourceId, date })
        .where(eq(incomes.id, id));
    }),

  deleteIncome: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(incomes).where(eq(incomes.id, id));
    }),

  addIncomeSource: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const { name } = input;

      await db.insert(incomeSources).values({
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

      await db.delete(incomes).where(eq(incomes.sourceId, id));
      await db.delete(incomeSources).where(eq(incomeSources.id, id));
    }),
});
