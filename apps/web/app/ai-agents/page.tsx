'use client';

import { useState } from 'react';
import { trpc } from '../../components/providers/trpc-provider';

export default function AIAgentsPage() {
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
  });

  // TRPC queries and mutations
  const { data: agents, refetch } = trpc['ai-agent'].list.useQuery({ userId: 'user_2mxNg1sxe8Eoj1r1MSDvN1ZMwkJ' }); // TODO: Get from auth
  const createAgent = trpc['ai-agent'].create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ name: '', instructions: '' });
    },
  });
  const deleteAgent = trpc['ai-agent'].delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAgent.mutateAsync({
        userId: 'user_2mxNg1sxe8Eoj1r1MSDvN1ZMwkJ', // TODO: Get from auth
        ...formData,
      });
    } catch (error) {
      console.error('Failed to create AI agent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this AI agent?')) {
      try {
        await deleteAgent.mutateAsync({ 
          id,
          userId: 'user_2mxNg1sxe8Eoj1r1MSDvN1ZMwkJ' // TODO: Get from auth
        });
      } catch (error) {
        console.error('Failed to delete AI agent:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="mt-2 text-gray-600">Manage your AI agents and their configurations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Agent Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Agent</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    rows={6}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Enter detailed instructions for the agent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createAgent.isPending}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAgent.isPending ? 'Creating...' : 'Create Agent'}
                </button>
              </form>
            </div>
          </div>

          {/* Agents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your AI Agents</h2>
              </div>
              <div className="p-6">
                {agents?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">🤖</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No AI agents yet</h3>
                    <p className="text-gray-600">Create your first AI agent to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents?.map((agent) => (
                      <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700">Instructions:</h4>
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                {agent.instructions}
                              </p>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                              Created: {new Date(agent.createdAt).toLocaleDateString()}
                              {agent.updatedAt !== agent.createdAt && (
                                <span> • Updated: {new Date(agent.updatedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => handleDelete(agent.id)}
                              disabled={deleteAgent.isPending}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 