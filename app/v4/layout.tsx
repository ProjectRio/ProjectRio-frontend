import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Design studies · Rio v4', template: '%s · Rio v4' },
  description: 'Visual design studies for Mario Superstar Baseball and Project Rio.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
