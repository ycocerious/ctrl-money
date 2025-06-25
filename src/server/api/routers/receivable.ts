import { eq, sum } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { receivables } from "~/server/db/schema";

export const receivableRouter = createTRPCRouter({
  getAllReceivables: publicProcedure.query(async () => {
    return db.select().from(receivables).orderBy(receivables.date);
  }),

  getTotalReceivableAmount: publicProcedure.query(async () => {
    const totalReceivableAmount = await db
      .select({ total: sum(receivables.amount) })
      .from(receivables);
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
    .mutation(async ({ input }) => {
      return db.insert(receivables).values(input);
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
    .mutation(async ({ input }) => {
      return db
        .update(receivables)
        .set(input)
        .where(eq(receivables.id, input.id));
    }),

  deleteReceivable: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.delete(receivables).where(eq(receivables.id, input.id));
    }),
});
