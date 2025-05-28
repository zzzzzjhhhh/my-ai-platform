'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';

export function TrpcDemo() {
  const [name, setName] = useState('');
  const hello = trpc.hello.useQuery({ name: name || undefined });

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-medium text-black">Test tRPC Endpoint</h2>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your name"
          />
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-800">
            {hello.isLoading ? 'Loading...' : hello.data?.greeting}
          </p>
        </div>
      </div>
    </div>
  );
} 