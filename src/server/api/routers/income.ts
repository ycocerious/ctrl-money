import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { incomes, incomeSources } from "~/server/db/schema";

export const incomeRouter = createTRPCRouter({
  getIncomeSources: publicProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(incomeSources)
      .where(eq(incomeSources.userId, ctx.userId))
      .orderBy(incomeSources.name);
  }),

  getIncomeStatementsForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date } = input;

      return db
        .select()
        .from(incomes)
        .where(
          and(
            sql`DATE_TRUNC('month', ${incomes.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(incomes.userId, ctx.userId),
          ),
        )
        .orderBy(incomes.date);
    }),

  getIncomeStatementsForSpecificSource: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { sourceId } = input;
      return db
        .select()
        .from(incomes)
        .where(
          and(eq(incomes.sourceId, sourceId), eq(incomes.userId, ctx.userId)),
        )
        .orderBy(desc(incomes.date));
    }),

  getTotalIncomeForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date } = input;

      const result = await db
        .select({
          totalAmount: sql<number>`sum(${incomes.amount})`,
        })
        .from(incomes)
        .where(
          and(
            sql`DATE_TRUNC('month', ${incomes.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(incomes.userId, ctx.userId),
          ),
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalIncomeForAllSources: publicProcedure.query(async ({ ctx }) => {
    const stats = await db
      .select({
        sourceId: incomes.sourceId,
        totalAmount: sql<number>`sum(${incomes.amount})`,
      })
      .from(incomes)
      .where(eq(incomes.userId, ctx.userId))
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
    .mutation(async ({ input, ctx }) => {
      const { amount, sourceId, date } = input;

      await db.insert(incomes).values({
        date,
        amount,
        sourceId,
        userId: ctx.userId,
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
    .mutation(async ({ input, ctx }) => {
      const { id, amount, sourceId, date } = input;

      await db
        .update(incomes)
        .set({ amount, sourceId, date })
        .where(and(eq(incomes.id, id), eq(incomes.userId, ctx.userId)));
    }),

  deleteIncome: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await db
        .delete(incomes)
        .where(and(eq(incomes.id, id), eq(incomes.userId, ctx.userId)));
    }),

  addIncomeSource: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      await db.insert(incomeSources).values({
        name,
        userId: ctx.userId,
      });
    }),

  editIncomeSource: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, name } = input;

      await db
        .update(incomeSources)
        .set({ name })
        .where(
          and(eq(incomeSources.id, id), eq(incomeSources.userId, ctx.userId)),
        );
    }),

  deleteIncomeSource: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await db
        .delete(incomes)
        .where(and(eq(incomes.sourceId, id), eq(incomes.userId, ctx.userId)));
      await db
        .delete(incomeSources)
        .where(
          and(eq(incomeSources.id, id), eq(incomeSources.userId, ctx.userId)),
        );
    }),
});
