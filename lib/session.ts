// Server-side only — reads httpOnly auth cookies. Never import from client components.
import { cookies } from 'next/headers';

export const JWT_COOKIE = 'jwt';
export const CSRF_COOKIE = 'jwt_csrf';

/** Decode the payload of a JWT without verifying it. Verification happens on
 *  the backend — this is only used to show session state in the UI. */
function decodeJwtPayload(token: string): Record<string, any> | null {
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	try {
		return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
	} catch {
		return null;
	}
}

export async function getJwt(): Promise<string | null> {
	return (await cookies()).get(JWT_COOKIE)?.value ?? null;
}

export async function getCsrfToken(): Promise<string | null> {
	return (await cookies()).get(CSRF_COOKIE)?.value ?? null;
}

/** Username from the JWT `sub` claim, or null when logged out/expired. */
export async function getSessionUsername(): Promise<string | null> {
	const jwt = await getJwt();
	if (!jwt) return null;
	const payload = decodeJwtPayload(jwt);
	if (!payload) return null;
	if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null;
	return typeof payload.sub === 'string' ? payload.sub : null;
}
