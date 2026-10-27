// Default fielder starting coordinates in game meters (x, y, z), home plate at
// the origin, +X toward first base. Source: pyRio (draw/draw_stadium.py,
// draw_fielder_positions).
export const FIELDER_STARTING_POSITIONS: { [position: string]: [number, number, number] } = {
	P: [0, 0.223, 18.4],
	C: [0, 0, -3.8],
	'1B': [18.5, 0, 22],
	'2B': [11, 0, 36],
	'3B': [-18.5, 0, 22],
	SS: [-11, 0, 36],
	LF: [-34, 0, 60],
	CF: [0, 0, 76],
	RF: [34, 0, 60]
};
