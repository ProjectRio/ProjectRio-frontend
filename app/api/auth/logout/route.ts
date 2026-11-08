import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JWT_COOKIE, CSRF_COOKIE } from '@/lib/session';

export async function POST() {
	// The backend JWT is stateless — logging out is just dropping our cookies.
	const cookieStore = await cookies();
	cookieStore.delete(JWT_COOKIE);
	cookieStore.delete(CSRF_COOKIE);
	return NextResponse.json({ success: true });
}
