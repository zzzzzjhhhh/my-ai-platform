import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export function createTRPCContext(opts: FetchCreateContextFnOptions) {
  return {
    headers: opts.req.headers,
  };
}; 