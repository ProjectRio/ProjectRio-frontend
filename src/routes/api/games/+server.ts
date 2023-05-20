import type { RequestHandler } from "@sveltejs/kit";
import {createApiHandler} from "$utils/apiHandler";

// export const GET: RequestHandler = createApiHandler('/games', 'GET');

const GET: RequestHandler = createApiHandler('/games', 'GET');

export { GET };