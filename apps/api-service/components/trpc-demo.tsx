'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';

interface Item {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TrpcDemo() {
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  // Query to fetch items
  const {
    data: items,
    isLoading: itemsLoading,
    error: itemsError,
    refetch,
  } = trpc.item.list.useQuery();

  // Mutations
  const createMutation = trpc.item.create.useMutation({
    onSuccess: () => {
      void refetch();
      setNewItemName('');
      setNewItemDescription('');
    },
  });

  const updateMutation = trpc.item.update.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const deleteMutation = trpc.item.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!newItemName.trim()) return;
    
    createMutation.mutate({
      name: newItemName,
      description: newItemDescription || null,
    });
  };

  const handleUpdate = (id: string, name: string) => {
    updateMutation.mutate({
      id,
      name,
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  if (itemsLoading) return <div>Loading items...</div>;
  if (itemsError) return <div>Error loading items: {itemsError.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">tRPC Demo</h1>
      
      {/* Create new item form */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Create New Item</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            placeholder="Item description (optional)"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </div>

      {/* Items list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        {items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item: Item) => (
              <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdate(item.id, `${item.name} (updated)`)}
                      disabled={updateMutation.isPending}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No items found. Create your first item above!</p>
        )}
      </div>
    </div>
  );
} 