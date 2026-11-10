'use client';

import { useState, type FormEvent } from 'react';
import { BACKEND, USER_ENDPOINTS } from '@/lib/api';

export default function ResetPasswordPage() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		try {
			const response = await fetch(BACKEND + USER_ENDPOINTS.REQUEST_PASSWORD_CHANGE, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username_or_email: email })
			});
			if (!response.ok) {
				setError('Could not request a reset. Check the email address and try again.');
				return;
			}
			setSent(true);
		} catch {
			setError('Could not reach the server. Try again in a moment.');
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="panel p-8">
				<h1 className="text-center text-3xl">Password Reset</h1>
				{sent ? (
					<p className="mt-6 text-center text-sm text-fog-300">
						Reset link sent — check your email for the link.
					</p>
				) : (
					<form onSubmit={handleSubmit} className="mt-8 space-y-5">
						<div>
							<label className="label" htmlFor="email">
								Email
							</label>
							<input
								id="email"
								type="email"
								className="input"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>
						{error && <p className="text-sm text-rio-300">{error}</p>}
						<button type="submit" className="btn-primary w-full">
							Send Reset Link
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
