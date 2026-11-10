'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error; reset: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-24 text-center">
			<h1 className="text-5xl">Unexpected Error</h1>
			<p className="mt-3 text-fog-500">Something went wrong. We&apos;re investigating the issue.</p>
			<div className="mt-8 flex gap-4">
				<button onClick={reset} className="btn-primary">
					Try Again
				</button>
				<Link href="/" className="btn-secondary">
					Go Home
				</Link>
			</div>
		</div>
	);
}
