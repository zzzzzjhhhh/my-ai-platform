import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { itemRouter } from './routers/item';

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
      };
    }),
  item: itemRouter,
});

export type AppRouter = typeof appRouter;