'use client';

// Client helpers for the authenticated backend proxy (/api/rio/*). Use these
// for anything that needs the logged-in user; plain public reads can keep
// using apiGet/apiPost from lib/api.ts against the backend directly.

export class RioApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

/** The backend aborts with werkzeug HTML error pages; the useful description
 *  lives in the <p> tag. JSON errors from the proxy use an `error` key. */
async function toError(response: Response): Promise<RioApiError> {
	const text = await response.text();
	let message = `Request failed (${response.status})`;
	try {
		const parsed = JSON.parse(text);
		message = parsed.error ?? parsed.description ?? parsed.msg ?? message;
	} catch {
		const match = text.match(/<p>([^<]+)<\/p>/);
		if (match) message = match[1];
	}
	return new RioApiError(response.status, message);
}

export async function rioGet<T = any>(path: string, params = ''): Promise<T> {
	const response = await fetch(`/api/rio/${path}${params}`);
	if (!response.ok) throw await toError(response);
	return response.json();
}

export async function rioPost<T = any>(path: string, body?: unknown): Promise<T> {
	const response = await fetch(`/api/rio/${path}`, {
		method: 'POST',
		...(body === undefined
			? {}
			: { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
	});
	if (!response.ok) throw await toError(response);
	return response.json();
}
