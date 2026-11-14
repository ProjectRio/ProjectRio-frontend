// Development-only: renders one stadium from the shared three.js scene for the
// draft room's pre-rendered field. scripts/render-stadiums.mjs drives it in
// headless Chrome; open it with ?live=1 to tune a park by eye.

import { notFound } from 'next/navigation';
import StadiumRenderClient from './StadiumRenderClient';

export const dynamic = 'force-static';

export default function StadiumRenderPage() {
	if (process.env.NODE_ENV === 'production') notFound();
	return <StadiumRenderClient />;
}
