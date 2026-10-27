'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { setStoredUsername } from '@/lib/useUsername';

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ Email: email, Password: password })
			});
			if (!response.ok) {
				setError('Login failed — check your email and password.');
				return;
			}
			const result = await response.json();
			if (result.username) setStoredUsername(result.username);
			router.push('/');
		} catch {
			setError('Could not reach the server. Try again in a moment.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="panel p-8">
				<div className="mb-8 text-center">
					<Image src="/images/RioLogo.png" alt="" width={56} height={56} className="mx-auto [image-rendering:pixelated]" />
					<h1 className="mt-4 text-3xl uppercase">Log In</h1>
					<p className="mt-1 text-sm text-fog-500">Welcome back to Project Rio</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="label" htmlFor="email">
							Email
						</label>
						<input
							id="email"
							type="email"
							className="input"
							required
							autoComplete="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="password">
							Password
						</label>
						<input
							id="password"
							type="password"
							className="input"
							required
							autoComplete="current-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</div>

					{error && <p className="text-sm text-rio-300">{error}</p>}

					<button type="submit" className="btn-primary w-full" disabled={submitting}>
						{submitting ? 'Logging in…' : 'Log In'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-fog-500">
					Forgot your password?{' '}
					<Link href="/login/reset_password" className="text-rio-400 hover:text-rio-300">
						Reset it here
					</Link>
				</p>
				<p className="mt-2 text-center text-sm text-fog-500">
					New to Project Rio?{' '}
					<Link href="/signup" className="text-rio-400 hover:text-rio-300">
						Create an account
					</Link>
				</p>
			</div>
		</div>
	);
}
