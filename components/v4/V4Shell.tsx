'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './v4.module.css';

const links = [
  ['/v4', 'Clubhouse'], ['/v4/roster', 'The roster'], ['/v4/ballparks', 'Ballparks'],
];

export default function V4Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className={s.root}>
    <a className={s.skip} href="#v4-content">Skip to content</a>
    <div className={s.previewBar}><div><span><b>V4</b> A new home for Mario Baseball</span><span><Link href="/v4/review">Design review</Link><a href="/design-v3/index.html">Compare v3 ↗</a><Link href="/">Current frontend ↗</Link></span></div></div>
    <header className={s.header}>
      <Link className={s.brand} href="/v4" aria-label="Project Rio clubhouse"><img src="/images/RioLogo.png" width="38" height="38" alt="" /><span>PROJECT <strong>RIO</strong><small>MARIO BASEBALL, TOGETHER.</small></span></Link>
      <nav aria-label="V4 navigation" className={s.nav}>
        {links.map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
        <Link href="/games/recent">Game center ↗</Link>
      </nav>
      <Link className={s.headerPlay} href="/rio-online/tutorial">Let’s play <span>↗</span></Link>
    </header>
    <main id="v4-content" className={s.main}>{children}</main>
    <footer className={s.footer}>
      <div className={s.footerBrand}><img src="/images/RioLogo.png" alt="" width="26" height="26" /><b>Made for the love of the game.</b></div>
      <div><a href="https://discord.gg/c3r9PabfRU" target="_blank" rel="noreferrer">Find us on Discord ↗</a><a href="https://github.com/ProjectRio" target="_blank" rel="noreferrer">Project Rio on GitHub ↗</a><Link href="/v4/review">About this design</Link></div>
      <small>A community project for Mario Superstar Baseball. Not affiliated with Nintendo.</small>
    </footer>
  </div>;
}
