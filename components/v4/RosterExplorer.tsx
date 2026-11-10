'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chemistry, chemistryKind, CLASSES, roster } from './data';
import s from './v4.module.css';

export default function RosterExplorer({ initialId }: { initialId: number }) {
  const [selected, setSelected] = useState(initialId);
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All types');
  const [captains, setCaptains] = useState(false);
  const [team, setTeam] = useState<number[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [message, setMessage] = useState('');
  const [relation, setRelation] = useState<'good' | 'bad'>('good');

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('rio-v4-nine') ?? '[]');
      if (Array.isArray(saved) && saved.length <= 9 && new Set(saved).size === saved.length && saved.every(id => Number.isInteger(id) && id >= 0 && id < 54)) setTeam(saved);
    } catch { setStorageAvailable(false); }
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (storageReady && storageAvailable) {
      try { localStorage.setItem('rio-v4-nine', JSON.stringify(team)); }
      catch { setStorageAvailable(false); }
    }
  }, [team, storageReady, storageAvailable]);

  const character = roster[selected];
  const shown = roster.filter(c => (!captains || c.cap) && (classFilter === 'All types' || c.className === classFilter) && `${c.name} ${c.key}`.toLowerCase().includes(query.toLowerCase().trim()));
  const relationships = roster.filter(c => c.id !== selected && chemistryKind(chemistry[selected][c.id]) === relation).sort((a, b) => relation === 'good' ? chemistry[selected][b.id] - chemistry[selected][a.id] : chemistry[selected][a.id] - chemistry[selected][b.id]);
  const goodPairs: [number, number][] = [];
  const badPairs: [number, number][] = [];
  team.forEach((a, i) => team.slice(i + 1).forEach(b => {
    const kind = chemistryKind(chemistry[a][b]);
    if (kind === 'good') goodPairs.push([a, b]);
    if (kind === 'bad') badPairs.push([a, b]);
  }));

  function add() {
    if (team.includes(selected)) return;
    if (team.length === 9) { setMessage('Your nine is full. Remove a character to make room.'); return; }
    setTeam([...team, selected]);
    setMessage(`${character.name} added to slot ${team.length + 1}.`);
  }

  return <div className={s.page}>
    <header className={s.pageHeading}><div><p className={s.eyebrow}>THE ROSTER / 54 CHARACTERS</p><h1>Know your <em>nine.</em></h1><p>Big bats. Quick gloves. Some very complicated friendships.</p></div><div className={s.headingAside}><b>THE NUMBERS ARE REAL.</b><span>Base attributes and chemistry<br />from the game’s roster data.</span></div></header>
    <section className={s.teamSheet} aria-label="Your nine">
      <div className={s.teamTitle}><h2>Your nine <span>{team.length}/9</span></h2><span>{storageAvailable ? 'Saved in this browser' : 'Saved for this visit only'} · Exploration lineup</span>{team.length > 0 && <button onClick={() => { setTeam([]); setMessage('Lineup cleared. Pick your next nine.'); }}>Clear lineup</button>}</div>
      <div className={s.slots}>{Array.from({ length: 9 }, (_, i) => <div key={i} className={s.slot} data-filled={team[i] !== undefined}>
        <span>{String(i + 1).padStart(2, '0')}</span>
        {team[i] !== undefined ? <><button className={s.slotCharacter} onClick={() => setSelected(team[i])} aria-label={`View ${roster[team[i]].name}`}><img src={roster[team[i]].icon} alt="" /><b>{roster[team[i]].name}</b></button><button className={s.remove} onClick={() => { setTeam(team.filter((_, n) => n !== i)); setMessage(`${roster[team[i]].name} removed.`); }} aria-label={`Remove ${roster[team[i]].name}`}>×</button></> : <div className={s.emptySlot}><span>＋</span><small>Open slot</small></div>}
      </div>)}</div>
      <div className={s.teamSummary}><span><i className={s.chemGood}>♪</i> {goodPairs.length} good {goodPairs.length === 1 ? 'pair' : 'pairs'}</span><span><i className={s.chemBad}>≋</i> {badPairs.length} anti {badPairs.length === 1 ? 'pair' : 'pairs'}</span><p>{team.length ? 'Pair counts describe relationships, not a team strength rating.' : 'Select a character below, then add them to your nine.'}</p></div>
      {badPairs.length > 0 && <details className={s.pairDetails}><summary>See anti-chemistry pairs</summary><ul>{badPairs.map(([a, b]) => <li key={`${a}-${b}`}>{roster[a].name} + {roster[b].name} <b>{chemistry[a][b]}</b></li>)}</ul></details>}
      <p className={s.status} role="status">{message}</p>
    </section>
    <div className={s.rosterLayout}>
      <section aria-label="Browse characters">
        <div className={s.filterBar}><label className={s.search}><span aria-hidden="true">⌕</span><input aria-label="Find a character" placeholder="Find a character…" value={query} onChange={e => setQuery(e.target.value)} /><span>{shown.length}</span></label><select aria-label="Character type" value={classFilter} onChange={e => setClassFilter(e.target.value)}>{['All types', ...CLASSES].map(type => <option key={type}>{type}</option>)}</select><button className={s.filterToggle} aria-pressed={captains} onClick={() => setCaptains(!captains)}>Captains</button></div>
        <div className={s.rosterGrid}>{shown.map(c => <button key={c.id} className={s.characterTile} data-class={c.className} aria-pressed={selected === c.id} onClick={() => setSelected(c.id)}><span className={s.tileMeta}>{c.cap ? 'C' : ''}{team.includes(c.id) && <b>IN YOUR NINE</b>}</span><img src={c.portrait} alt="" loading="lazy" /><span className={s.tileName}>{c.name}</span><small>{c.className}</small></button>)}</div>
        {shown.length === 0 && <div className={s.emptyResults}><h2>No characters on this bench.</h2><p>Try another name or clear your filters.</p><button className={s.darkButton} onClick={() => { setQuery(''); setClassFilter('All types'); setCaptains(false); }}>Show all 54</button></div>}
        <p className={s.dataNote}>C = captain eligible. Base attributes are shown, without Superstar upgrades. This is a roster sandbox, not a ruleset or draft validator.</p>
      </section>
      <aside className={s.characterReport} aria-label="Selected character report">
        <div className={s.reportArt} data-class={character.className}><span>SCOUTING REPORT <b>#{String(selected + 1).padStart(2, '0')}</b></span><img src={character.portrait} alt={character.name} /><div><small>{character.className}{character.cap ? ' / Captain eligible' : ''}</small><h2>{character.name}</h2></div></div>
        <div className={s.reportBody}>
          <div className={s.attributes}>{['Batting', 'Pitching', 'Running', 'Fielding'].map((label, i) => <div key={label}><span>{label}</span><meter min="0" max="10" value={character.bars[i]} aria-label={`${label}: ${character.bars[i]} out of 10`} /><b>{character.bars[i]}<small>/10</small></b></div>)}</div>
          <div className={s.abilities}>{character.ab.map(a => <span key={a}>{a}</span>)}</div>
          <button className={s.primary} disabled={team.includes(selected) || team.length === 9} onClick={add}>{team.includes(selected) ? '✓ In your nine' : team.length === 9 ? 'Your nine is full' : 'Add to your nine'} <span>＋</span></button>
          <div className={s.relationshipTitle}><h3>The chemistry</h3><div><button aria-pressed={relation === 'good'} onClick={() => setRelation('good')}>Good</button><button aria-pressed={relation === 'bad'} onClick={() => setRelation('bad')}>Anti</button></div></div>
          <p className={s.relationDescription}>{relation === 'good' ? 'Good chemistry starts at 90. These are the teammates who click.' : 'Below 20 is anti-chemistry. Watch these pairings in the field.'}</p>
          <div className={s.relationships}>{relationships.map(c => <button key={c.id} onClick={() => setSelected(c.id)}><img src={c.icon} alt="" /><span>{c.name}</span><b className={relation === 'good' ? s.goodValue : s.badValue}>{chemistry[selected][c.id]}</b><span aria-hidden="true">↗</span></button>)}{relationships.length === 0 && <p>No {relation === 'good' ? 'good' : 'anti'} chemistry partners in the base roster.</p>}</div>
          <Link className={s.reportLink} href={`/characters/${encodeURIComponent(character.key)}`}>Full stats & swing analysis ↗</Link>
        </div>
      </aside>
    </div>
  </div>;
}
