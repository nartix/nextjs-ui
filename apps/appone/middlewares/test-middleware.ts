'user server';

import { MiddlewareHandler } from '@/types/middleware-handler';

export const testMiddleware: MiddlewareHandler = async (req, res) => {
  //set cookie using res

  res?.cookies.set('test', 'test');
  res?.headers.set('test', 'test');
  return { next: true };
};
