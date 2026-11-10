'use client';

import { use, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { BACKEND, USER_ENDPOINTS } from '@/lib/api';

export default function ChangePasswordPage({ params }: { params: Promise<{ active_url: string }> }) {
	const { active_url } = use(params);
	const [password, setPassword] = useState('');
	const [done, setDone] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		try {
			const response = await fetch(BACKEND + USER_ENDPOINTS.CHANGE_PASSWORD, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ active_url, password })
			});
			if (!response.ok) {
				setError('Could not change your password. The reset link may have expired.');
				return;
			}
			setDone(true);
		} catch {
			setError('Could not reach the server. Try again in a moment.');
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="panel p-8">
				<h1 className="text-center text-3xl">New Password</h1>
				{done ? (
					<div className="mt-6 text-center">
						<p className="text-sm text-fog-300">Your password has been successfully changed.</p>
						<Link href="/login" className="btn-primary mt-6">
							Log In
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="mt-8 space-y-5">
						<div>
							<label className="label" htmlFor="password">
								New Password
							</label>
							<input
								id="password"
								type="password"
								className="input"
								required
								minLength={1}
								autoComplete="new-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>
						{error && <p className="text-sm text-rio-300">{error}</p>}
						<button type="submit" className="btn-primary w-full">
							Change Password
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
