import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center py-24 text-center">
			<Image src="/images/RioLogo.png" alt="" width={64} height={64} className="[image-rendering:pixelated] opacity-60" />
			<h1 className="mt-6 text-5xl">Foul Ball</h1>
			<p className="mt-3 text-fog-500">That page doesn&apos;t exist.</p>
			<Link href="/" className="btn-primary mt-8">
				Back to Home Plate
			</Link>
		</div>
	);
}
