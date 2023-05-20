import type { RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '../fetch/apiFetch';

export function createApiHandler(route: string, method: string): RequestHandler {
  return async ({ request }) => {
    try {
      const data = await apiFetch(route, { method });

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: unknown) {
      if (typeof error === 'string') {
        return new Response(error, { status: 500 });
      } else {
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  };
}
