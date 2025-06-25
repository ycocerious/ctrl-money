import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { investmentAssets, investments } from "~/server/db/schema";

export const investmentRouter = createTRPCRouter({
  getInvestmentAssets: publicProcedure.query(async () => {
    return db.select().from(investmentAssets).orderBy(investmentAssets.name);
  }),

  getInvestmentStatementsForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      return db
        .select()
        .from(investments)
        .where(
          sql`DATE_TRUNC('month', ${investments.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        )
        .orderBy(investments.date);
    }),

  getInvestmentStatementsForSpecificAssetAndMonth: publicProcedure
    .input(z.object({ assetId: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      const { assetId, date } = input;
      return db
        .select()
        .from(investments)
        .where(
          and(
            eq(investments.assetId, assetId),
            sql`DATE_TRUNC('month', ${investments.date}::date) = DATE_TRUNC('month', ${date}::date)`,
          ),
        )
        .orderBy(desc(investments.date));
    }),

  getTotalInvestmentForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      const result = await db
        .select({
          totalAmount: sql<number>`sum(${investments.amount})`,
        })
        .from(investments)
        .where(
          sql`DATE_TRUNC('month', ${investments.date}::date) = DATE_TRUNC('month', ${date}::date)`,
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalInvestmentForAllAssets: publicProcedure.query(async () => {
    const stats = await db
      .select({
        assetId: investments.assetId,
        totalAmount: sql<number>`sum(${investments.amount})`,
      })
      .from(investments)
      .groupBy(investments.assetId);

    return stats;
  }),

  addInvestment: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        assetId: z.string(),
        date: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { amount, assetId, date, name } = input;

      await db.insert(investments).values({
        date,
        amount,
        assetId,
        name,
      });
    }),

  editInvestment: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        assetId: z.string(),
        date: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, amount, assetId, date, name } = input;

      await db
        .update(investments)
        .set({ amount, assetId, date, name })
        .where(eq(investments.id, id));
    }),

  deleteInvestment: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(investments).where(eq(investments.id, id));
    }),

  addInvestmentAsset: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const { name } = input;

      await db.insert(investmentAssets).values({
        name,
      });
    }),

  editInvestmentAsset: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const { id, name } = input;

      await db
        .update(investmentAssets)
        .set({ name })
        .where(eq(investmentAssets.id, id));
    }),

  deleteInvestmentAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await db.delete(investments).where(eq(investments.assetId, id));
      await db.delete(investmentAssets).where(eq(investmentAssets.id, id));
    }),
});
