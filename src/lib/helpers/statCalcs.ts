export const getPa = (stats: any) => stats?.summary_at_bats + stats?.summary_walks_hbp + stats?.summary_walks_bb + stats?.summary_sac_flys;
export const getAvg = (stats: any) => stats?.summary_hits / stats?.summary_at_bats;
export const getObp = (stats: any) => (stats?.summary_hits + stats?.summary_walks_hbp + stats?.summary_walks_bb) / getPa(stats).toFixed(3);
export const getSlg = (stats: any) => (stats?.summary_singles + (stats?.summary_doubles * 2) + (stats?.summary_triples * 3) + (stats?.summary_homeruns * 4)) / stats?.summary_at_bats
export const getOps = (stats: any) => getObp(stats) + getSlg(stats);

export const getIpString = (stats: any) => Math.floor(stats?.outs_pitched / 3) + "." + stats?.outs_pitched % 3;
export const getOppAvg = (stats: any) => (stats?.hits_allowed / (stats?.batters_faced - stats?.walks_bb - stats?.walks_hbp)).toFixed(3);
export const getKPct = (stats: any) => (stats?.strikeouts_pitched / stats?.batters_faced * 100).toFixed(1)
export const getERA = (stats: any) => (stats?.runs_allowed / (stats?.outs_pitched / 27)).toFixed(2)