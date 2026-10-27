'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BACKEND, USER_ENDPOINTS } from '@/lib/api';

const SPECIAL_CHARS = /[#?!@$%^&*-]/;

interface Check {
	label: string;
	met: boolean;
}

function ChecklistItem({ label, met, dimmed }: Check & { dimmed: boolean }) {
	return (
		<li
			className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
				met ? 'text-emerald-400' : dimmed ? 'text-fog-500' : 'text-rio-300'
			}`}
		>
			<span className="inline-block w-3 text-center font-bold">{met ? '✓' : '▸'}</span>
			{label}
		</li>
	);
}

export default function SignupForm() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [createdEmail, setCreatedEmail] = useState<string | null>(null);

	const usernameChecks: Check[] = [
		{ label: 'Letters and numbers only', met: /^[A-Za-z0-9]+$/.test(username) },
		{ label: '30 characters or fewer', met: username.length > 0 && username.length <= 30 }
	];
	const passwordChecks: Check[] = [
		{ label: 'At least 8 characters', met: password.length >= 8 },
		{ label: 'One uppercase letter', met: /[A-Z]/.test(password) },
		{ label: 'One lowercase letter', met: /[a-z]/.test(password) },
		{ label: 'One number', met: /[0-9]/.test(password) },
		{ label: 'One special character', met: SPECIAL_CHARS.test(password) },
		{ label: 'Passwords match', met: password.length > 0 && password === confirm }
	];

	const allValid =
		usernameChecks.every((check) => check.met) && passwordChecks.every((check) => check.met) && email.includes('@');

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!allValid) {
			setError('A few requirements still need attention — check the list below your password.');
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const response = await fetch(BACKEND + USER_ENDPOINTS.REGISTER, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ Username: username, Email: email, Password: password })
			});
			if (response.ok) {
				setCreatedEmail(email);
			} else if (response.status === 409) {
				setError('That username or email is already taken.');
			} else if (response.status === 406) {
				setError('The server rejected that username or email — double-check both and try again.');
			} else if (response.status === 502) {
				setError(
					'Your account was created, but the verification email failed to send. Reach out on Discord and we will sort it out.'
				);
			} else {
				setError('Something went wrong on our end. Try again in a moment.');
			}
		} catch {
			setError('Could not reach the server. Try again in a moment.');
		} finally {
			setSubmitting(false);
		}
	}

	if (createdEmail) {
		return (
			<div className="panel shadow-[0_0_60px_rgb(230_0_18/0.14)]">
				<div className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
					<Image
						src="/images/RioLogo.png"
						alt=""
						width={72}
						height={72}
						className="float-gently [image-rendering:pixelated]"
					/>
					<p className="kicker mt-8">Account created</p>
					<h2 className="mt-2 text-3xl uppercase">You&rsquo;re on the roster</h2>
					<p className="mt-4 max-w-sm text-sm leading-relaxed text-fog-300">
						We sent a verification link to <span className="font-semibold text-fog-100">{createdEmail}</span>. Verify
						your address to claim your Rio Key — the token that links the Project Rio client to your account.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Link href="/login" className="btn-primary">
							Log In
						</Link>
						<Link href="/" className="btn-secondary">
							Back to Home
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="panel shadow-[0_0_60px_rgb(230_0_18/0.14)]">
			<div className="flex items-center gap-3 border-b border-night-700 bg-night-850 px-6 py-4">
				<Image src="/images/RioLogo.png" alt="" width={24} height={24} className="[image-rendering:pixelated]" />
				<h2 className="text-lg uppercase tracking-wider">Create your account</h2>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8" noValidate>
				<div>
					<label className="label" htmlFor="signup-username">
						Username
					</label>
					<input
						id="signup-username"
						className="input"
						required
						maxLength={30}
						autoComplete="username"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
					/>
					{username.length > 0 && !usernameChecks.every((check) => check.met) && (
						<ul className="mt-2 space-y-1">
							{usernameChecks.map((check) => (
								<ChecklistItem key={check.label} {...check} dimmed={false} />
							))}
						</ul>
					)}
				</div>

				<div>
					<label className="label" htmlFor="signup-email">
						Email
					</label>
					<input
						id="signup-email"
						type="email"
						className="input"
						required
						autoComplete="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					<div>
						<label className="label" htmlFor="signup-password">
							Password
						</label>
						<input
							id="signup-password"
							type="password"
							className="input"
							required
							autoComplete="new-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="signup-confirm">
							Confirm Password
						</label>
						<input
							id="signup-confirm"
							type="password"
							className="input"
							required
							autoComplete="new-password"
							value={confirm}
							onChange={(event) => setConfirm(event.target.value)}
						/>
					</div>
				</div>

				<ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2" aria-label="Password requirements">
					{passwordChecks.map((check) => (
						<ChecklistItem key={check.label} {...check} dimmed={password.length === 0} />
					))}
				</ul>

				{error && (
					<p className="text-sm text-rio-300" role="alert">
						{error}
					</p>
				)}

				<button type="submit" className="btn-primary w-full py-3 text-base" disabled={submitting}>
					{submitting ? 'Creating your account…' : 'Create Account'}
				</button>

				<p className="text-center text-sm text-fog-500">
					Already on the roster?{' '}
					<Link href="/login" className="text-rio-400 transition-colors hover:text-rio-300">
						Log in
					</Link>
				</p>
			</form>
		</div>
	);
}
