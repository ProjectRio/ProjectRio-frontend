// Import the GET handler from the +server.ts file
import { GET } from '../api/games/+server';

// Use the GET handler in your page's load function
export async function load({ fetch }) {
  const response = await fetch(GET, { method: 'GET' });
  const data = await response.json();
  
  // Process the data and return it
  return {
    props: {
      data
    }
  };
}
