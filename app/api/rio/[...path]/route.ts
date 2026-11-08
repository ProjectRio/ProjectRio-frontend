import { NextResponse } from 'next/server';
import { BACKEND } from '@/lib/api';
import { getJwt, getCsrfToken } from '@/lib/session';

// Authenticated proxy to the Rio backend. The JWT lives in an httpOnly cookie
// on our domain, so client JS can never read it; this route attaches it when
// forwarding. Only management/lookup endpoints are reachable — everything else
// (stats, games) keeps calling the backend directly and needs no auth.
const ALLOWED_PREFIXES = [
	'community/',
	'tag/',
	'tag_set/',
	'user_group/',
	'user_groups/',
	'patreon/',
	'user/all',
	'user/community',
	'user/prune',
	'user/delete',
	'validate_JWT'
];

// Auth fields the proxy owns. Stripped from client bodies so a compromised
// page can't smuggle someone else's credentials through us.
const STRIPPED_BODY_KEYS = ['rio_key', 'Rio Key', 'api_key', 'ADMIN_KEY', 'community_key'];

function isAllowed(path: string): boolean {
	return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

function sameOrigin(request: Request): boolean {
	const origin = request.headers.get('origin');
	if (!origin) return true; // same-origin fetches may omit the header
	const host = request.headers.get('host');
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}

async function forward(request: Request, path: string, body?: string) {
	const jwt = await getJwt();
	const csrf = await getCsrfToken();

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (jwt) {
		// Send the JWT both ways flask-jwt-extended can be configured to read it.
		headers['Authorization'] = `Bearer ${jwt}`;
		headers['Cookie'] = `access_token_cookie=${jwt}${csrf ? `; csrf_access_token=${csrf}` : ''}`;
		if (csrf) headers['X-CSRF-TOKEN'] = csrf;
	}

	const search = new URL(request.url).search;
	const upstream = await fetch(`${BACKEND}/${path}${search}`, {
		method: request.method,
		headers,
		...(body !== undefined ? { body } : {})
	});

	const text = await upstream.text();
	return new NextResponse(text, {
		status: upstream.status,
		headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' }
	});
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context) {
	const path = (await context.params).path.join('/');
	if (!isAllowed(path)) return NextResponse.json({ error: 'Endpoint not allowed' }, { status: 404 });
	return forward(request, path);
}

export async function POST(request: Request, context: Context) {
	const path = (await context.params).path.join('/');
	if (!isAllowed(path)) return NextResponse.json({ error: 'Endpoint not allowed' }, { status: 404 });
	if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });

	// The backend 400s on a JSON content type with an empty body, so only
	// forward a body when the client actually sent one.
	const raw = await request.text();
	if (!raw) return forward(request, path);

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
	}
	if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
		for (const key of STRIPPED_BODY_KEYS) delete (parsed as Record<string, unknown>)[key];
	}
	return forward(request, path, JSON.stringify(parsed));
}
