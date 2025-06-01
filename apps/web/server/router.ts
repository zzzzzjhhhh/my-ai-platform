import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { aiAgentRouter } from './routers/ai-agent';

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
      };
    }),
  "ai-agent": aiAgentRouter,
});

export type AppRouter = typeof appRouter; 