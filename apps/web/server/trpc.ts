import { initTRPC, TRPCError } from '@trpc/server';
import { createTRPCContext, type Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

// Middleware to check for authenticated user
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      // Infers session and user are non-null
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Export a reusable protected procedure
export const protectedProcedure = t.procedure.use(isAuthenticated); 