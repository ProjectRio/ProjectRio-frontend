'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CameraPresetName, VisualizerScene } from '@/components/visualizer/scene';
import { parks, roster } from './data';
import s from './v4.module.css';

export default function Ballparks() {
  const [parkId, setParkId] = useState(0);
  const [camera, setCamera] = useState<CameraPresetName>('broadcast');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<VisualizerScene | null>(null);
  const park = parks[parkId];

  useEffect(() => {
    let cancelled = false;
    let scene: VisualizerScene | undefined;
    const controller = new AbortController();
    setStatus('loading');
    async function load() {
      try {
        const [{ VisualizerScene }, { getTheme3D }, response] = await Promise.all([
          import('@/components/visualizer/scene'), import('@/components/visualizer/stadiumThemes'),
          fetch(`/stadiums/${parkId}.json`, { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error('Stadium unavailable');
        const data = await response.json();
        if (cancelled || !host.current) return;
        scene = new VisualizerScene(host.current, { cameraPreset: 'broadcast', introFlyIn: false, bloom: false, fielderMarkers: false, impact: false, trail: false });
        scene.buildStadium(data, getTheme3D(parkId));
        sceneRef.current = scene;
        setStatus('ready');
      } catch {
        scene?.dispose();
        scene = undefined;
        if (!cancelled) setStatus('error');
      }
    }
    void load();
    return () => { cancelled = true; controller.abort(); scene?.dispose(); sceneRef.current = null; };
  }, [parkId, retry]);

  useEffect(() => {
    if (status === 'ready') sceneRef.current?.setCameraPreset(camera, !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, [camera, status]);

  return <div className={s.page}>
    <header className={s.pageHeading}><div><p className={s.eyebrow}>SIX BALLPARKS. ONE BONUS FIELD.</p><h1>Home field <em>feeling.</em></h1><p>Same bat. Different backyard. Get to know the places we play.</p></div><div className={s.headingAside}><b>TAKE A LOOK AROUND.</b><span>Explore the real field geometry<br />with Rio’s stadium visualizer.</span></div></header>
    <div className={s.parkTabs} aria-label="Choose a ballpark">{parks.map(p => <button key={p.id} aria-pressed={p.id === parkId} onClick={() => setParkId(p.id)}><img src={roster[p.host].icon} alt="" /><span>{p.name}</span></button>)}</div>
    <section className={s.parkFeature}>
      <div className={s.stadiumViewport}>
        <div className={s.canvasHost} ref={host} aria-label={`Interactive collision model of ${park.name}`} role="img" />
        <div className={s.stadiumBadge}><span>FIELD GUIDE / {String(park.id + 1).padStart(2, '0')}</span><h2>{park.name}</h2></div>
        {status !== 'ready' && <div className={s.modelStatus} role="status"><span className={s.modelBall}>◈</span><h3>{status === 'loading' ? 'Opening the gates…' : 'The field couldn’t load.'}</h3><p>{status === 'loading' ? 'Getting the stadium ready for a closer look.' : 'The 3D preview needs WebGL and the local stadium data.'}</p>{status === 'error' && <button className={s.creamButton} onClick={() => setRetry(retry + 1)}>Try again</button>}</div>}
        <div className={s.cameraControls} aria-label="Camera view">{([['broadcast', 'Grandstand'], ['blimp', 'Overhead'], ['catcher', 'Home plate']] as const).map(([id, name]) => <button key={id} disabled={status !== 'ready'} aria-pressed={camera === id} onClick={() => { setCamera(id); if (camera === id) sceneRef.current?.setCameraPreset(id, !window.matchMedia('(prefers-reduced-motion: reduce)').matches); }}>{name}</button>)}</div>
      </div>
      <aside className={s.parkStory} style={{ '--park-color': park.color } as React.CSSProperties}>
        <span className={s.eyebrow}>MEET THE BALLPARK</span><img src={roster[park.host].portrait} alt="" /><h2>{park.subtitle}</h2><p>{park.description}</p><div><b>FROM THE SCOUT’S NOTEBOOK</b><p>{park.note}</p></div><Link className={s.darkButton} href="/characters/swing-lab">Head to the swing lab <span>↗</span></Link>
      </aside>
    </section>
    <div className={s.parkLegend}><span><i style={{ background: park.color }} /> Rio’s field model · interpretive colors</span><span>Drag to orbit · scroll to zoom · choose a camera to reset</span></div>
    <section className={s.parkNotes}><div><span>01 / THE SHAPE</span><h3>The field is part of the game.</h3><p>These are the same stadium meshes used by the existing hit visualizer. Compare their boundaries, then follow a hit in the game center.</p></div><div><span>02 / THE LIMITS</span><h3>A field guide, not a replay.</h3><p>Colors come from the frontend’s stadium themes. This view doesn’t reproduce the game’s textures, animated hazards, or game rules.</p></div><div><span>03 / YOUR NEXT SWING</span><h3>Put the research to work.</h3><p>Pair the field with a character’s contact and trajectory tools. The existing swing lab is one click away.</p></div></section>
  </div>;
}
