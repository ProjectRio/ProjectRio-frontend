'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { setStoredUsername } from '@/lib/useUsername';

export default function LogoutPage() {
	const [done, setDone] = useState(false);

	useEffect(() => {
		fetch('/api/auth/logout', { method: 'POST' })
			.catch(() => {})
			.finally(() => {
				setStoredUsername(null);
				setDone(true);
			});
	}, []);

	return (
		<div className="mx-auto max-w-md">
			<div className="panel p-8 text-center">
				<h1 className="text-3xl">{done ? 'Logged Out' : 'Logging out…'}</h1>
				{done && (
					<>
						<p className="mt-3 text-sm text-fog-500">You have been successfully logged out.</p>
						<Link href="/" className="btn-primary mt-6">
							Back to Home
						</Link>
					</>
				)}
			</div>
		</div>
	);
}
