import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';


export const aiAgentRouter = router({
  list: protectedProcedure
    .query(async ({ctx}) => {
      try {
        return await ctx.prisma.aIAgent.findMany({
          where: {
            userId: ctx.session.user.id
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } catch (error) {
        console.error('Error fetching AI agents:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch AI agents from database',
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(z.object({ 
      name: z.string().min(1, 'Agent name is required'),
      instructions: z.string().min(1, 'Agent instructions are required'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const newAgent = await ctx.prisma.aIAgent.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
          },
        });
        return newAgent;
      } catch (error) {
        console.error('Error creating AI agent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create AI agent',
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().min(1, 'Agent name is required').optional(),
      instructions: z.string().min(1, 'Agent instructions are required').optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existingAgent = await ctx.prisma.aIAgent.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!existingAgent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'AI agent not found or access denied',
          });
        }

        const updatedAgent = await ctx.prisma.aIAgent.update({
          where: {
            id: input.id,
          },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.instructions && { instructions: input.instructions }),
          },
        });
        return updatedAgent;
      } catch (error) {
        console.error('Error updating AI agent:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update AI agent',
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      userId: z.string() // For authorization check
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // First, verify the agent belongs to the user
        const existingAgent = await ctx.prisma.aIAgent.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!existingAgent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'AI agent not found or access denied',
          });
        }

        // Delete the AI agent
        await ctx.prisma.aIAgent.delete({
          where: {
            id: input.id,
          },
        });
        return true;
      } catch (error) {
        console.error('Error deleting AI agent:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete AI agent',
          cause: error,
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      userId: z.string() // For authorization check
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Fetch a specific AI agent that belongs to the user
        const agent = await ctx.prisma.aIAgent.findFirst({
          where: {
            id: input.id,
            userId: input.userId,
          },
        });

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'AI agent not found or access denied',
          });
        }

        return agent;
      } catch (error) {
        console.error('Error fetching AI agent:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch AI agent',
          cause: error,
        });
      }
    }),
}); 