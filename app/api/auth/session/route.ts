import { NextResponse } from 'next/server';
import { getSessionUsername } from '@/lib/session';

/** Lets client components ask "who am I?" without ever seeing the JWT. */
export async function GET() {
	const username = await getSessionUsername();
	return NextResponse.json({ username });
}
