'use client';

import { useEffect, useRef, useState } from 'react';
import { PARKS } from './themes';
import type { createStudyScene } from './scene';
import s from './study.module.css';

export default function StadiumStudy(){
  const [stadium,setStadium]=useState(1),[refined,setRefined]=useState(true),[motion,setMotion]=useState(false);
  const [status,setStatus]=useState('Loading stadium…'),[failed,setFailed]=useState(false),[swatches,setSwatches]=useState<string[]>([]),[attempt,setAttempt]=useState(0);
  const host=useRef<HTMLDivElement>(null),root=useRef<HTMLElement>(null),engine=useRef<ReturnType<typeof createStudyScene>|null>(null),motionRef=useRef(false);
  const park=PARKS[stadium];
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setMotion(!preference.matches);update();preference.addEventListener('change',update);
    const observer=new ResizeObserver(()=>{window.parent.postMessage({type:'rio-stadium-study-height',height:root.current?.scrollHeight},window.location.origin);});
    if(root.current)observer.observe(root.current);
    return ()=>{preference.removeEventListener('change',update);observer.disconnect();};
  },[]);
  useEffect(()=>{motionRef.current=motion;engine.current?.setMotion(motion);},[motion]);
  useEffect(()=>{
    let cancelled=false;const abort=new AbortController();let active:ReturnType<typeof createStudyScene>|null=null;
    setStatus('Loading stadium…');setFailed(false);setSwatches([]);
    Promise.all([import('./scene'),import('./materials'),fetch(`/stadiums/${stadium}.json`,{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('Stadium unavailable');return r.json();})]).then(([module,materials,data])=>{
      if(cancelled||!host.current)return;
      active=module.createStudyScene(host.current,data,stadium,refined,motionRef.current);engine.current=active;
      setSwatches(PARKS[stadium].materials.map((kind,i)=>materials.makeSurface(kind,PARKS[stadium].colors[i]).toDataURL()));
      setStatus('');
    }).catch(error=>{if(!cancelled&&error.name!=='AbortError'){setStatus('The 3D study could not load. Try again or use a browser with WebGL enabled.');setFailed(true);}});
    return ()=>{cancelled=true;abort.abort();active?.dispose();if(engine.current===active)engine.current=null;};
  },[stadium,refined,attempt]);
  return <main className={s.study} ref={root}>
    <div className={s.parkChoices} role="group" aria-label="Choose a stadium">
      {PARKS.map((item,i)=><button key={item.name} type="button" aria-pressed={i===stadium} onClick={()=>setStadium(i)}><img alt="" src={item.icon?`/images/Characters/${item.icon}.png`:'/images/baseball.png'}/><span>{item.name}</span></button>)}
    </div>
    <div className={s.topline}><span>PROJECT RIO <i>/</i> MOTION & MATERIAL STUDY</span><div className={s.switch} role="group" aria-label="Compare material direction"><button aria-pressed={!refined} onClick={()=>setRefined(false)}>Visualizer palette</button><button aria-pressed={refined} onClick={()=>setRefined(true)}>Refined materials</button></div></div>
    <div className={s.stage}>
      <div className={s.canvas} ref={host}/>
      <div className={s.caption}><span>{String(stadium+1).padStart(2,'0')} / 07</span><h1>{park.name}</h1><p>{refined?park.title:'Original visualizer colors · flat surfaces'}</p></div>
      <div className={s.motion}><button type="button" aria-pressed={motion} onClick={()=>setMotion(!motion)}>{motion?'Ⅱ Pause motion':'▷ Play motion'}</button></div>
      {status&&<div className={s.status} role="status"><span>{status}</span>{failed&&<button onClick={()=>setAttempt(n=>n+1)}>Try again</button>}</div>}
      <div className={s.stageFoot}><span>Drag to explore · scroll to zoom</span><div><button onClick={()=>engine.current?.overhead()}>Overhead</button><button onClick={()=>engine.current?.reset()}>Reset view</button></div></div>
    </div>
    <div className={s.notes}>
      <div className={s.direction}><span className={s.eyebrow}>THE MATERIAL DIRECTION</span><h2>{park.title}</h2><p>{park.description}</p></div>
      <div className={s.materials} aria-label="Original generated material swatches">{park.labels.map((label,i)=><figure key={label}>{swatches[i]?<img src={swatches[i]} alt={`${label}, generated surface sample`}/>:<div className={s.placeholder}/>}<figcaption>{label}<small>{park.colors[i]}</small></figcaption></figure>)}</div>
    </div>
    <footer className={s.footer}><p>Original generated surfaces, informed by the game’s materials. Existing Rio visualizer geometry. This is a design specimen; website placement remains open.</p><a href="/design-v4/stadium-image-study.html?style=refined#specimen-6" target="_top">Earlier image study ↗</a></footer>
  </main>;
}
