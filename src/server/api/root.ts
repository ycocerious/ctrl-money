import { incomeRouter } from "~/server/api/routers/income";
import { receivableRouter } from "~/server/api/routers/receivable";
import { spendRouter } from "~/server/api/routers/spend";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  income: incomeRouter,
  spend: spendRouter,
  receivable: receivableRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
