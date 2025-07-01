import { and, desc, eq, sum } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { receivables } from "~/server/db/schema";

export const receivableRouter = createTRPCRouter({
  getAllReceivables: publicProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(receivables)
      .where(eq(receivables.userId, ctx.userId))
      .orderBy(desc(receivables.amount));
  }),

  getTotalReceivableAmount: publicProcedure.query(async ({ ctx }) => {
    const totalReceivableAmount = await db
      .select({ total: sum(receivables.amount) })
      .from(receivables)
      .where(eq(receivables.userId, ctx.userId));
    return totalReceivableAmount?.[0]?.total ?? 0;
  }),

  addReceivable: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        name: z.string(),
        purpose: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return db.insert(receivables).values({ ...input, userId: ctx.userId });
    }),

  editReceivable: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        name: z.string(),
        purpose: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return db
        .update(receivables)
        .set(input)
        .where(
          and(eq(receivables.id, input.id), eq(receivables.userId, ctx.userId)),
        );
    }),

  deleteReceivable: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return db
        .delete(receivables)
        .where(
          and(eq(receivables.id, input.id), eq(receivables.userId, ctx.userId)),
        );
    }),
});
