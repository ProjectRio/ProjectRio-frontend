'use client';

import { usePathname } from 'next/navigation';

/** The v4 comparison has its own chrome; all existing routes keep their shell. */
export default function AppShell({ children, header, footer }: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === '/v4' || pathname.startsWith('/v4/')) return children;
  return (
    <>
      {header}
      {/* Keyed so each route fades in on the game's text-fade table. */}
      {/* The landing page is a full-bleed title screen; every other route sits in the column. */}
      <main
        key={pathname}
        className={pathname === '/' ? 'route-in w-full flex-1' : 'route-in mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8'}
      >
        {children}
      </main>
      {footer}
    </>
  );
}
