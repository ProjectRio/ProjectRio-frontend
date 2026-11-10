import { redirect } from 'next/navigation';

// V4 now leads to the design-only refinement of v3.
// The first product-oriented experiment is retained in design-language-v4/archive.
export default function V4DesignStudy() {
  redirect('/design-v4/index.html');
}
