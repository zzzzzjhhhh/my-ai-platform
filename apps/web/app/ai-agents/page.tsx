'use client';

import { useState, useEffect } from 'react';
import { trpc } from '../../components/providers/trpc-provider';
import { useAuth } from '../../components/providers/auth-provider';

export default function AIAgentsPage() {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
  });

  // TRPC queries and mutations
  const { data: agents, refetch, isLoading } = trpc['ai-agent'].list.useQuery(
    undefined,
    { enabled: !!session }
  );
  
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

  useEffect(() => {
    if (session) {
      refetch();
    }
  }, [session, refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      console.error('No session, cannot create agent');
      return;
    }
    try {
      await createAgent.mutateAsync({
        ...formData,
      });
    } catch (error) {
      console.error('Failed to create AI agent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) {
      console.error('No session, cannot delete agent');
      return;
    }
    if (confirm('Are you sure you want to delete this AI agent?')) {
      try {
        await deleteAgent.mutateAsync({ 
          id,
        });
      } catch (error) {
        console.error('Failed to delete AI agent:', error);
      }
    }
  };

  if (!session && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">AI Agents</h1>
        <p>Please log in to manage your AI agents.</p>
      </div>
    );
  }
  
  if (isLoading && !agents) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">AI Agents</h1>
        <p>Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Your AI Agents</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-lg shadow-md bg-card">
        <h2 className="text-xl font-semibold mb-4">Create New Agent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Agent Name</label>
            <input 
              type="text" 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary bg-background text-foreground"
              required 
            />
          </div>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-muted-foreground mb-1">Instructions (Persona)</label>
            <textarea 
              id="instructions" 
              value={formData.instructions} 
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} 
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary bg-background text-foreground h-24"
              required 
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={createAgent.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {createAgent.isPending ? 'Creating...' : 'Create Agent'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
        {isLoading && <p>Loading agents...</p>}
        {!isLoading && agents && agents.length === 0 && <p>You haven't created any AI agents yet.</p>}
        {agents && agents.length > 0 && (
          <ul className="space-y-4">
            {agents.map((agent) => (
              <li key={agent.id} className="p-4 border rounded-lg shadow-sm bg-card flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{agent.instructions}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {agent.id}</p>
                </div>
                <button 
                  onClick={() => handleDelete(agent.id)} 
                  disabled={deleteAgent.isPending && deleteAgent.variables?.id === agent.id}
                  className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 text-sm"
                >
                  {(deleteAgent.isPending && deleteAgent.variables?.id === agent.id) ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 