/* Project Rio — Web UI kit. Interactive recreation of the live site,
   composing the design-system primitives from the compiled bundle. */
const { useState } = React;
const NS = window.ProjectRioDesignSystem_6fbb66;
const { Button, Badge, TierBadge, Input, Select, Avatar, LiveLabel, LiveDot, Panel, PanelHeader, PageHeader, LadderTable, StatTable, GameScoreCard } = NS;

const A = '../../assets';
const sprite = (n) => `${A}/characters/${n}.png`;

/* ----------------------------- data ----------------------------- */
const GAMES = [
	{ status: 'Final', timeAgo: '4m ago', mode: 'Big Balls Brawl', stadium: 'Mario Stadium',
		away: { user: 'DingerCity', score: 9, sprite: sprite('Mario'), elo: { before: 1980, after: 1998 } },
		home: { user: 'JoeBaseball', score: 4, sprite: sprite('Bowser'), elo: { before: 1876, after: 1858 } } },
	{ status: 'Final / 7', timeAgo: '22m ago', mode: 'Standard', stadium: 'Bowser Castle',
		away: { user: 'Roeming', score: 2, sprite: sprite('Peach'), elo: { before: 1542, after: 1527 } },
		home: { user: 'NokiMain', score: 11, sprite: sprite('DK'), elo: { before: 1180, after: 1205 } } },
	{ status: 'Final', timeAgo: '1h ago', mode: 'Star Mode', stadium: 'Peach Garden',
		away: { user: 'ShyGuyGod', score: 6, sprite: sprite('Yoshi'), elo: { before: 1410, after: 1426 } },
		home: { user: 'WarioWare', score: 5, sprite: sprite('Wario'), elo: { before: 1455, after: 1439 } } },
	{ status: 'Final', timeAgo: '2h ago', mode: 'Big Balls Brawl', stadium: 'Yoshi Park',
		away: { user: 'BabyBomber', score: 3, sprite: sprite('Daisy'), elo: { before: 1290, after: 1276 } },
		home: { user: 'KingOfBoos', score: 8, sprite: sprite('King Boo'), elo: { before: 1620, after: 1638 } } },
	{ status: 'Final / 9', timeAgo: '3h ago', mode: 'Standard', stadium: 'DK Jungle',
		away: { user: 'DiddyDinger', score: 7, sprite: sprite('Diddy'), elo: { before: 1335, after: 1351 } },
		home: { user: 'GhostRunner', score: 6, sprite: sprite('Boo'), elo: { before: 1500, after: 1484 } } },
	{ status: 'Final', timeAgo: '5h ago', mode: 'Star Mode', stadium: 'Wario Palace',
		away: { user: 'JuniorVarsity', score: 1, sprite: sprite('Bowser Jr'), elo: { before: 1120, after: 1108 } },
		home: { user: 'PlumberMain', score: 4, sprite: sprite('Luigi'), elo: { before: 1205, after: 1219 } } }
];

const LADDER = [
	{ username: 'DingerCity', rating: 2014, wins: 142, losses: 38 },
	{ username: 'KingOfBoos', rating: 1638, wins: 121, losses: 64 },
	{ username: 'Roeming', rating: 1542, wins: 98, losses: 70 },
	{ username: 'GhostRunner', rating: 1484, wins: 88, losses: 71 },
	{ username: 'WarioWare', rating: 1439, wins: 76, losses: 68 },
	{ username: 'ShyGuyGod', rating: 1426, wins: 71, losses: 65 },
	{ username: 'DiddyDinger', rating: 1351, wins: 64, losses: 62 },
	{ username: 'BabyBomber', rating: 1276, wins: 55, losses: 60 },
	{ username: 'PlumberMain', rating: 1219, wins: 49, losses: 58 },
	{ username: 'NokiMain', rating: 1205, wins: 47, losses: 55 }
];

const CHARACTERS = [
	{ name: 'Mario', cls: 'Balance' }, { name: 'Luigi', cls: 'Balance' }, { name: 'Peach', cls: 'Technique' },
	{ name: 'Daisy', cls: 'Balance' }, { name: 'Yoshi', cls: 'Speed' }, { name: 'DK', cls: 'Power' },
	{ name: 'Diddy', cls: 'Speed' }, { name: 'Bowser', cls: 'Power' }, { name: 'Bowser Jr', cls: 'Power' },
	{ name: 'Wario', cls: 'Power' }, { name: 'Boo', cls: 'Technique' }, { name: 'King Boo', cls: 'Power' }
];

const CLASS_COLOR = { Balance: 'gray', Power: 'red', Speed: 'green', Technique: 'gold' };

const BOX = {
	away: { user: 'DingerCity', score: 9, sprite: sprite('Mario'),
		batters: [
			{ name: 'Mario', ab: 5, h: 3, hr: 2, rbi: 5, bb: 0, avg: '.600' },
			{ name: 'Peach', ab: 5, h: 2, hr: 0, rbi: 1, bb: 0, avg: '.400' },
			{ name: 'Yoshi', ab: 4, h: 2, hr: 0, rbi: 1, bb: 1, avg: '.500' },
			{ name: 'Toad(R)', ab: 4, h: 1, hr: 0, rbi: 1, bb: 0, avg: '.250' },
			{ name: 'Boo', ab: 4, h: 1, hr: 1, rbi: 1, bb: 0, avg: '.250' }
		],
		pitchers: [{ name: 'Mario', ip: '7.0', h: 6, r: 4, k: 9, bb: 2, era: '5.14' }] },
	home: { user: 'JoeBaseball', score: 4, sprite: sprite('Bowser'),
		batters: [
			{ name: 'Bowser', ab: 5, h: 2, hr: 1, rbi: 2, bb: 0, avg: '.400' },
			{ name: 'DK', ab: 4, h: 1, hr: 1, rbi: 2, bb: 1, avg: '.250' },
			{ name: 'Wario', ab: 4, h: 1, hr: 0, rbi: 0, bb: 0, avg: '.250' },
			{ name: 'Bowser Jr', ab: 4, h: 0, hr: 0, rbi: 0, bb: 0, avg: '.000' },
			{ name: 'Magikoopa(R)', ab: 3, h: 1, hr: 0, rbi: 0, bb: 1, avg: '.333' }
		],
		pitchers: [{ name: 'Bowser', ip: '7.0', h: 9, r: 9, k: 4, bb: 2, era: '11.57' }] }
};

const BAT_COLS = [
	{ key: 'name', label: 'Batters' }, { key: 'ab', label: 'AB' }, { key: 'h', label: 'H' },
	{ key: 'hr', label: 'HR' }, { key: 'rbi', label: 'RBI' }, { key: 'bb', label: 'BB' },
	{ key: 'avg', label: 'AVG', align: 'right' }
];
const PITCH_COLS = [
	{ key: 'name', label: 'Pitchers' }, { key: 'ip', label: 'IP' }, { key: 'h', label: 'H' },
	{ key: 'r', label: 'R' }, { key: 'k', label: 'K' }, { key: 'bb', label: 'BB' },
	{ key: 'era', label: 'ERA', align: 'right' }
];

/* ----------------------------- nav ----------------------------- */
const NAV = ['Home', 'Ranked', 'Characters', 'Box Score'];

function Nav({ route, setRoute, user, onLogin }) {
	return (
		<header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border-card)', background: 'rgb(7 7 11 / 0.9)', backdropFilter: 'blur(8px)' }}>
			<div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', height: 'var(--nav-height)', display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px' }}>
				<a onClick={() => setRoute('Home')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
					<img src={`${A}/logos/mushroom.png`} width="36" height="36" className="pixelated" alt="" />
					<span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>
						Project<span style={{ color: 'var(--rio-500)' }}>Rio</span>
					</span>
				</a>
				<nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
					{NAV.map((item) => {
						const active = route === item;
						return (
							<a key={item} onClick={() => setRoute(item)}
								style={{ padding: '8px 12px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: active ? 'var(--rio-400)' : 'var(--fog-300)' }}>
								{item}
							</a>
						);
					})}
				</nav>
				<a onClick={() => setRoute('Box Score')} style={{ cursor: 'pointer' }}><LiveLabel>2 Live</LiveLabel></a>
				{user
					? <a onClick={() => setRoute('Ranked')} style={{ cursor: 'pointer' }}><Avatar name={user} /></a>
					: <Button size="sm" onClick={onLogin}>Log In</Button>}
			</div>
		</header>
	);
}

/* ----------------------------- screens ----------------------------- */
function HomeScreen({ setRoute }) {
	const features = [
		{ t: 'Ranked Ladders', d: 'Climb from Shell to Legend in seasonal ranked play with full ELO tracking.', go: 'Ranked' },
		{ t: 'Player Stats', d: 'Every at-bat and every pitch recorded. Batting, pitching, and matchup history.', go: 'Box Score' },
		{ t: 'Character Stats', d: 'Community-wide performance for all 54 characters — find your roster edge.', go: 'Characters' },
		{ t: 'Tools & Visualizers', d: 'Pitch trajectory calculator, stream overlays, and more for players and casters.', go: 'Ranked' }
	];
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
			<section style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-card)', background: 'var(--surface-card)', padding: '72px 24px', textAlign: 'center' }}>
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'var(--wash-hero), repeating-linear-gradient(135deg, transparent 0 40px, rgb(255 255 255 / 0.015) 40px 41px)' }} />
				<div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
					<img src={`${A}/logos/mushroom.png`} width="96" height="96" className="pixelated" alt="" />
					<h1 style={{ marginTop: 24, fontSize: 'var(--text-6xl)', textTransform: 'uppercase', lineHeight: 1.05 }}>
						Competitive <span style={{ color: 'var(--rio-500)' }}>Mario Superstar Baseball</span>
					</h1>
					<p style={{ margin: '16px auto 0', maxWidth: 560, fontSize: 'var(--text-lg)', color: 'var(--fog-300)' }}>
						Online ranked play, live game tracking, and deep stats for the Mario Superstar Baseball community — powered by Project Rio.
					</p>
					<div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
						<Button icon={`${A}/icons/baseball-bat.png`}>Get Project Rio</Button>
						<Button variant="secondary" onClick={() => setRoute('Ranked')}>View Ladders</Button>
						<Button variant="secondary" onClick={() => setRoute('Box Score')}>Watch Live</Button>
					</div>
				</div>
			</section>

			<section>
				<div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
					<div><p className="kicker">Around the league</p><h2 style={{ marginTop: 4, fontSize: 'var(--text-3xl)', textTransform: 'uppercase' }}>Latest Games</h2></div>
					<a onClick={() => setRoute('Box Score')} className="kicker" style={{ cursor: 'pointer', color: 'var(--rio-400)' }}>All Games →</a>
				</div>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
					{GAMES.map((g, i) => <GameScoreCard key={i} {...g} onBoxScore={() => setRoute('Box Score')} />)}
				</div>
			</section>

			<section>
				<p className="kicker">Everything tracked</p>
				<h2 style={{ margin: '4px 0 24px', fontSize: 'var(--text-3xl)', textTransform: 'uppercase' }}>Explore Project Rio</h2>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
					{features.map((f) => (
						<a key={f.t} onClick={() => setRoute(f.go)} style={{ cursor: 'pointer' }}>
							<Panel glow style={{ padding: 20, height: '100%', boxSizing: 'border-box' }}>
								<h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-tight)' }}>{f.t}</h3>
								<p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--fog-500)' }}>{f.d}</p>
								<span className="kicker" style={{ display: 'inline-block', marginTop: 16, color: 'var(--rio-400)' }}>Open →</span>
							</Panel>
						</a>
					))}
				</div>
			</section>
		</div>
	);
}

function RankedScreen() {
	const [mode, setMode] = useState('Standard');
	return (
		<div>
			<PageHeader kicker="Ranked play" title="Standard Ladder">
				<div style={{ width: 200 }}>
					<Select value={mode} onChange={(e) => setMode(e.target.value)}>
						<option>Standard</option><option>Big Balls Brawl</option><option>Star Mode</option>
					</Select>
				</div>
			</PageHeader>
			<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
				<Panel><LadderTable rows={LADDER} highlightUser="Roeming" /></Panel>
				<Panel>
					<PanelHeader title="Season 4" action={<Badge color="red">Live</Badge>} />
					<div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
						<Stat label="Ranked players" value="1,284" />
						<Stat label="Games this season" value="18,402" />
						<Stat label="Top tier" value={<TierBadge tier="Legend I" />} />
						<Stat label="Ends in" value="11 days" />
					</div>
				</Panel>
			</div>
		</div>
	);
}

function Stat({ label, value }) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<span style={{ fontSize: 'var(--text-sm)', color: 'var(--fog-500)' }}>{label}</span>
			<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fog-100)' }}>{value}</span>
		</div>
	);
}

function CharactersScreen() {
	const [filter, setFilter] = useState('All');
	const classes = ['All', 'Balance', 'Power', 'Speed', 'Technique'];
	const shown = filter === 'All' ? CHARACTERS : CHARACTERS.filter((c) => c.cls === filter);
	return (
		<div>
			<PageHeader kicker="Roster" title="Characters">
				<div style={{ display: 'flex', gap: 8 }}>
					{classes.map((c) => (
						<Button key={c} size="sm" variant={filter === c ? 'primary' : 'secondary'} onClick={() => setFilter(c)}>{c}</Button>
					))}
				</div>
			</PageHeader>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
				{shown.map((c) => (
					<Panel key={c.name} glow style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
						<img src={sprite(c.name)} width="52" height="52" style={{ objectFit: 'contain', imageRendering: 'pixelated', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', padding: 2 }} alt={c.name} />
						<div>
							<div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, textTransform: 'uppercase' }}>{c.name}</div>
							<div style={{ marginTop: 6 }}><Badge color={CLASS_COLOR[c.cls]}>{c.cls}</Badge></div>
						</div>
					</Panel>
				))}
			</div>
		</div>
	);
}

function BoxScoreScreen() {
	const homeWon = BOX.home.score > BOX.away.score;
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
			<div className="panel" style={{ position: 'relative', overflow: 'hidden', padding: 24 }}>
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 70% 120% at 50% -20%, rgb(230 0 18 / 0.18), transparent)' }} />
				<div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24 }}>
					<TeamScore team={BOX.away} won={!homeWon} align="left" />
					<div style={{ textAlign: 'center' }}>
						<p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--fog-500)' }}>Final</p>
						<div style={{ marginTop: 8 }}><Badge color="red">Big Balls Brawl</Badge></div>
					</div>
					<TeamScore team={BOX.home} won={homeWon} align="right" />
				</div>
			</div>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
				{[BOX.away, BOX.home].map((t, i) => (
					<Panel key={i}>
						<PanelHeader title={`${t.user} (${i === 0 ? 'Away' : 'Home'})`} />
						<StatTable rowKey="name" columns={BAT_COLS} rows={t.batters} />
						<div style={{ borderTop: '1px solid var(--border-card)' }}>
							<StatTable rowKey="name" columns={PITCH_COLS} rows={t.pitchers} />
						</div>
					</Panel>
				))}
			</div>
		</div>
	);
}

function TeamScore({ team, won, align }) {
	const right = align === 'right';
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 16, flexDirection: right ? 'row-reverse' : 'row', textAlign: right ? 'right' : 'left' }}>
			<img src={team.sprite} width="64" height="64" style={{ objectFit: 'contain', imageRendering: 'pixelated' }} alt="" />
			<div><span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>{team.user}</span></div>
			<span style={{ [right ? 'marginRight' : 'marginLeft']: 'auto', fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: won ? 'var(--fog-100)' : 'var(--fog-500)' }}>{team.score}</span>
		</div>
	);
}

/* ----------------------------- footer ----------------------------- */
function Footer() {
	return (
		<footer style={{ marginTop: 64, borderTop: '1px solid var(--border-card)', background: 'var(--surface-card)' }}>
			<div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<img src={`${A}/logos/mushroom.png`} width="28" height="28" className="pixelated" alt="" />
					<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>Project<span style={{ color: 'var(--rio-500)' }}>Rio</span></span>
				</div>
				<div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-sm)', color: 'var(--fog-500)' }}>
					<span>Discord</span><span>Patreon</span><span>GitHub</span>
				</div>
			</div>
			<div style={{ borderTop: '1px solid var(--border-hairline)', padding: '14px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--fog-500)' }}>
				Project Rio is a fan project and is not affiliated with Nintendo.
			</div>
		</footer>
	);
}

/* ----------------------------- app ----------------------------- */
function App() {
	const [route, setRoute] = useState('Home');
	const [user, setUser] = useState(null);
	const screens = {
		Home: <HomeScreen setRoute={setRoute} />,
		Ranked: <RankedScreen />,
		Characters: <CharactersScreen />,
		'Box Score': <BoxScoreScreen />
	};
	return (
		<div className="shell">
			<Nav route={route} setRoute={setRoute} user={user} onLogin={() => setUser('DingerCity')} />
			<div className="main">{screens[route]}</div>
			<Footer />
		</div>
	);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
