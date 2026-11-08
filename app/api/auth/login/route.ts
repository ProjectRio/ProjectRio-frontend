import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND, USER_ENDPOINTS } from '@/lib/api';
import { JWT_COOKIE, CSRF_COOKIE } from '@/lib/session';

const WEEK_SECONDS = 60 * 60 * 24 * 7;

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax',
	maxAge: WEEK_SECONDS
} as const;

/** Pull the csrf_access_token value out of the backend's Set-Cookie headers.
 *  flask-jwt-extended pairs every JWT cookie with a CSRF token that must be
 *  echoed in an X-CSRF-TOKEN header when the JWT is sent as a cookie. */
function extractCsrfToken(response: Response): string | null {
	for (const value of response.headers.getSetCookie?.() ?? []) {
		const match = value.match(/^csrf_access_token=([^;]+)/);
		if (match) return match[1];
	}
	return null;
}

export async function POST(request: Request) {
	const body = await request.json();

	const response = await fetch(BACKEND + USER_ENDPOINTS.LOGIN, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ Email: body.Email, Password: body.Password })
	});

	if (!response.ok) {
		return NextResponse.json({ error: 'Login failed' }, { status: response.status });
	}

	const result = await response.json();
	if (result.access_token) {
		const cookieStore = await cookies();
		cookieStore.set(JWT_COOKIE, result.access_token, COOKIE_OPTIONS);
		const csrf = extractCsrfToken(response);
		if (csrf) cookieStore.set(CSRF_COOKIE, csrf, COOKIE_OPTIONS);
	}

	return NextResponse.json({ username: result.username ?? null, msg: result.msg ?? null });
}
