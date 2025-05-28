import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { PrismaClient } from '../../app/generated/prisma';
import { TRPCError } from '@trpc/server';

const prisma = new PrismaClient();

export const aiAgentRouter = router({
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Fetch all AI agents for the specific user
        return await prisma.aIAgent.findMany({
          where: {
            userId: input.userId,
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

  create: publicProcedure
    .input(z.object({ 
      name: z.string().min(1, 'Agent name is required'),
      instructions: z.string().min(1, 'Agent instructions are required'),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        // Create a new AI agent in the database
        const newAgent = await prisma.aIAgent.create({
          data: {
            name: input.name,
            instructions: input.instructions,
            userId: input.userId,
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

  update: publicProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().min(1, 'Agent name is required').optional(),
      instructions: z.string().min(1, 'Agent instructions are required').optional(),
      userId: z.string() // For authorization check
    }))
    .mutation(async ({ input }) => {
      try {
        // First, verify the agent belongs to the user
        const existingAgent = await prisma.aIAgent.findFirst({
          where: {
            id: input.id,
            userId: input.userId,
          },
        });

        if (!existingAgent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'AI agent not found or access denied',
          });
        }

        // Update the AI agent
        const updatedAgent = await prisma.aIAgent.update({
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

  delete: publicProcedure
    .input(z.object({ 
      id: z.string(),
      userId: z.string() // For authorization check
    }))
    .mutation(async ({ input }) => {
      try {
        // First, verify the agent belongs to the user
        const existingAgent = await prisma.aIAgent.findFirst({
          where: {
            id: input.id,
            userId: input.userId,
          },
        });

        if (!existingAgent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'AI agent not found or access denied',
          });
        }

        // Delete the AI agent
        await prisma.aIAgent.delete({
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

  getById: publicProcedure
    .input(z.object({ 
      id: z.string(),
      userId: z.string() // For authorization check
    }))
    .query(async ({ input }) => {
      try {
        // Fetch a specific AI agent that belongs to the user
        const agent = await prisma.aIAgent.findFirst({
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