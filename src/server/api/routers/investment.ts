import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { investmentAssets, investments } from "~/server/db/schema";

export const investmentRouter = createTRPCRouter({
  getInvestmentAssets: publicProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(investmentAssets)
      .where(eq(investmentAssets.userId, ctx.userId))
      .orderBy(investmentAssets.name);
  }),

  getInvestmentStatementsForSpecificMonth: publicProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date } = input;

      return db
        .select()
        .from(investments)
        .where(
          and(
            sql`DATE_TRUNC('month', ${investments.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(investments.userId, ctx.userId),
          ),
        )
        .orderBy(investments.date);
    }),

  getInvestmentStatementsForSpecificAsset: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { assetId } = input;
      return db
        .select()
        .from(investments)
        .where(
          and(
            eq(investments.assetId, assetId),
            eq(investments.userId, ctx.userId),
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
    .query(async ({ input, ctx }) => {
      const { date } = input;

      const result = await db
        .select({
          totalAmount: sql<number>`sum(${investments.amount})`,
        })
        .from(investments)
        .where(
          and(
            sql`DATE_TRUNC('month', ${investments.date}::date) = DATE_TRUNC('month', ${date}::date)`,
            eq(investments.userId, ctx.userId),
          ),
        );

      return result[0]?.totalAmount ?? 0;
    }),

  getTotalInvestmentForAllAssets: publicProcedure.query(async ({ ctx }) => {
    const stats = await db
      .select({
        assetId: investments.assetId,
        totalAmount: sql<number>`sum(${investments.amount})`,
      })
      .from(investments)
      .where(eq(investments.userId, ctx.userId))
      .groupBy(investments.assetId)
      .orderBy(desc(sql<number>`sum(${investments.amount})`));

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
    .mutation(async ({ input, ctx }) => {
      const { amount, assetId, date, name } = input;

      await db.insert(investments).values({
        date,
        amount,
        assetId,
        name,
        userId: ctx.userId,
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
    .mutation(async ({ input, ctx }) => {
      const { id, amount, assetId, date, name } = input;

      await db
        .update(investments)
        .set({ amount, assetId, date, name })
        .where(and(eq(investments.id, id), eq(investments.userId, ctx.userId)));
    }),

  deleteInvestment: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await db
        .delete(investments)
        .where(and(eq(investments.id, id), eq(investments.userId, ctx.userId)));
    }),

  addInvestmentAsset: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      await db.insert(investmentAssets).values({
        name,
        userId: ctx.userId,
      });
    }),

  editInvestmentAsset: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, name } = input;

      await db
        .update(investmentAssets)
        .set({ name })
        .where(
          and(
            eq(investmentAssets.id, id),
            eq(investmentAssets.userId, ctx.userId),
          ),
        );
    }),

  deleteInvestmentAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await db
        .delete(investments)
        .where(
          and(eq(investments.assetId, id), eq(investments.userId, ctx.userId)),
        );
      await db
        .delete(investmentAssets)
        .where(
          and(
            eq(investmentAssets.id, id),
            eq(investmentAssets.userId, ctx.userId),
          ),
        );
    }),
});
