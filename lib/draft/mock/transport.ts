'use client';

// MockTransport (§10b): the DraftTransport interface over in-browser servers,
// one per league, with a shared tick loop, simulated latency and outages.

import { LEAGUES, type LeagueFixture } from '../fixtures';
import { getPreview } from '../preview';
import type { ActionResult, DraftAction, DraftSnapshot, DraftTransport, Viewer } from '../types';
import { runBots } from './bots';
import { MockDraftServer } from './server';

const servers = new Map<number, MockDraftServer>();
let ticker: ReturnType<typeof setInterval> | null = null;

function ensureTicker() {
	if (ticker || typeof window === 'undefined') return;
	ticker = setInterval(() => {
		const now = Date.now();
		for (const server of servers.values()) {
			server.tick(now);
			runBots(server, now);
		}
	}, 250);
}

export function getServer(leagueId: number): MockDraftServer | null {
	let server = servers.get(leagueId);
	if (!server) {
		const fixture = LEAGUES.find((league) => league.id === leagueId);
		if (!fixture) return null;
		server = new MockDraftServer(fixture);
		servers.set(leagueId, server);
	}
	ensureTicker();
	return server;
}

export function resetServer(leagueId: number) {
	servers.delete(leagueId);
}

export function listFixtures(): LeagueFixture[] {
	return LEAGUES;
}

function latency(): number {
	return getPreview().slowNetwork ? 1400 : 60 + Math.random() * 90;
}

export class MockTransport implements DraftTransport {
	subscribe(draftId: number, viewer: Viewer, onSnapshot: (snapshot: DraftSnapshot) => void): () => void {
		const server = getServer(draftId);
		if (!server) return () => {};
		let closed = false;
		const unsubscribe = server.subscribe(viewer, (snapshot) => {
			if (closed) return;
			if (getPreview().offline) return;
			const wait = latency();
			setTimeout(() => {
				if (!closed) onSnapshot(snapshot);
			}, wait);
		});
		return () => {
			closed = true;
			unsubscribe();
		};
	}

	async act(draftId: number, viewer: Viewer, action: DraftAction): Promise<ActionResult> {
		const server = getServer(draftId);
		await new Promise((resolve) => setTimeout(resolve, latency()));
		if (!server) return { ok: false, code: 'NETWORK', message: 'No such draft.' };
		if (getPreview().offline) return { ok: false, code: 'NETWORK', message: 'Could not reach the server.' };
		const result = server.act(viewer, action);
		if (result.ok) await new Promise((resolve) => setTimeout(resolve, latency() / 2));
		return result;
	}
}

let transport: MockTransport | null = null;

export function getTransport(): DraftTransport {
	if (!transport) transport = new MockTransport();
	return transport;
}
