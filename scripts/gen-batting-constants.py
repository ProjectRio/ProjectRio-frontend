#!/usr/bin/env python3
"""Regenerate lib/mssb/BattingSimulation/battingConstants.json from the
RioVisualizer package (decompiled game tables).

Usage:
    python3 scripts/gen-batting-constants.py [path-to-RioVisualizer]

The tables are copied verbatim so the TypeScript batting simulation stays
bit-identical with the reference Python implementation. Re-run only when the
upstream constants change.
"""
import importlib.util
import json
import sys
from pathlib import Path

RIO_VIS = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / 'GitHub' / 'RioVisualizer')
sys.path.insert(0, str(RIO_VIS))

spec = importlib.util.spec_from_file_location(
    'rio_constants', RIO_VIS / 'rio_visualizer' / 'data' / 'constants.py')
constants = importlib.util.module_from_spec(spec)
spec.loader.exec_module(constants)

# Everything calc_batting.py / the visualizer needs. Scalar enums are inlined
# in TypeScript for readability; only data tables live in the JSON.
TABLE_NAMES = [
    # batting calculation tables
    'STATS',
    'BATTER_HITBOXES',
    'BATTING_REACHES',
    'CONTACT_CHEM_LINK_MULTIPLIERS',
    'POWER_CHEM_LINK_MULTIPLIERS',
    'BALL_CONTACT_ARRAY_807B6294',
    'BUNT_ANGLE_CALC_ARRAY',
    'BUNTING_CONTACT_ARRAY',
    'BUNTING_POWER_ARRAY',
    'BATTING_ANGLE_RANGES',
    'BATTING_VERTICAL_ANGLE_WEIGHTS',
    'UINT_ARRAY_ARRAY_807B7134',
    'SHORT_ARRAY_ARRAY_ARRAY_ARRAY_807B67CC',
    'SHORT_ARRAY_ARRAY_807B6AF4',
    'NON_CAPTAIN_STAR_VERTICAL_ANGLES',
    'CAPTAIN_STAR_VERTICAL_ANGLES',
    'BALL_HIT_ARRAY',
    'STAR_SWING_EXIT_VELOCITY_ARRAY',
    'CAPTAIN_STAR_SWING_EXIT_VELOCITY_ARRAY',
    'CURSED_BALL_DEBUFF_ARRAY',
    'FIELD_TRAJECTORY_BONUSES',
    'FLOAT_ARRAY_ARRAY_807B72BC',
    # fielder overlay tables (visualizer)
    'FIELDER_STARTING_COORDINATES',
    'FIELDER_DIVE_RANGE',
    'FIELDER_JOGGING_SPEED',
    'FIELDER_LOCKOUT_BYPOSITION',
    'FIELDER_SLIDINGCATCH_ABILITY',
]

SCALAR_NAMES = ['MOONSHOT_MULTIPLIER', 'gravity', 'airResistance']

out = {name: getattr(constants, name) for name in TABLE_NAMES + SCALAR_NAMES}

target = Path(__file__).resolve().parent.parent / 'lib' / 'mssb' / 'BattingSimulation' / 'battingConstants.json'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(out, separators=(',', ':')) + '\n')
print(f'Wrote {target} ({target.stat().st_size / 1024:.0f} KB)')
