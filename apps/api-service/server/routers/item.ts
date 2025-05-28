import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { PrismaClient } from '../../app/generated/prisma';
import { TRPCError } from '@trpc/server';

// Dummy data store (replace with your actual database logic)
let items: { id: string; name: string; description: string | null }[] = [
  { id: '1', name: 'Sample Item 1', description: 'This is a sample item' },
  { id: '2', name: 'Sample Item 2', description: null },
];

const prisma = new PrismaClient();

export const itemRouter = router({
  list: publicProcedure
    .query(async () => {
      try {
        // Fetch all items from the database
        return await prisma.item.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
      } catch (error) {
        console.error('Error fetching items:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch items from database',
          cause: error,
        });
      }
    }),

  create: publicProcedure
    .input(z.object({ name: z.string(), description: z.string().nullable().optional() }))
    .mutation(async ({ input }) => {
      try {
        // Create a new item in the database
        const newItem = await prisma.item.create({
          data: {
            name: input.name,
            description: input.description ?? null,
          },
        });
        return newItem;
      } catch (error) {
        console.error('Error creating item:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create item',
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().nullable().optional() }))
    .mutation(async ({ input }) => {
      try {
        // Update an existing item in the database
        const updatedItem = await prisma.item.update({
          where: {
            id: input.id,
          },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.description !== undefined && { description: input.description }),
          },
        });
        return updatedItem;
      } catch (error) {
        console.error('Error updating item:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update item',
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Delete an item from the database
        await prisma.item.delete({
          where: {
            id: input.id,
          },
        });
        return true;
      } catch (error) {
        console.error('Error deleting item:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete item',
          cause: error,
        });
      }
    }),
}); 