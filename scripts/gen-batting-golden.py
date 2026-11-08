#!/usr/bin/env python3
"""Generate golden test vectors for the TypeScript batting-simulation port.

Runs the reference Python implementation (RioVisualizer) over a seeded random
spread of inputs and writes {inputs, output} pairs. Validate the port with:

    python3 scripts/gen-batting-golden.py /tmp/batting-golden.json
    npx tsx scripts/check-batting-port.ts /tmp/batting-golden.json
"""
import json
import random
import sys
from pathlib import Path

RIO_VIS = Path.home() / 'GitHub' / 'RioVisualizer'
sys.path.insert(0, str(RIO_VIS))

from rio_visualizer.calc import calc_batting  # noqa: E402
from rio_visualizer.data import constants as C  # noqa: E402

rng = random.Random(20260715)

N_CASES = 1200
cases = []

for i in range(N_CASES):
    batter_x = rng.uniform(-1.2, 1.2)
    # Mostly hittable contact offsets (reach is roughly [-0.85, 0.35]),
    # with some deliberate misses to exercise the error path.
    offset = rng.uniform(-1.1, 0.6) if i % 9 else rng.choice([-3.0, 3.0])
    inputs = {
        'batter_id': rng.randrange(len(C.STATS)),
        'is_batter_captain': rng.random() < 0.5,
        'pitcher_id': rng.randrange(len(C.STATS)),
        'easy_batting': rng.random() < 0.1,
        'handedness': rng.randrange(2),
        'batter_x': batter_x,
        'ball_x': batter_x + offset,
        'ball_z': rng.uniform(-0.6, 2.2),
        'chem': rng.randrange(len(C.CONTACT_CHEM_LINK_MULTIPLIERS)),
        'num_stars': rng.randrange(6),
        'hit_type': rng.choice([0, 0, 0, 1, 1, 1, 2, 3]),
        'is_star_hit': rng.random() < 0.25,
        'is_starred': rng.random() < 0.15,
        'pitch_type': rng.randrange(4),
        'charge_up': rng.choice([0.0, rng.random(), 1.0]),
        'charge_down': rng.choice([0.0, rng.random(), 1.0]),
        'frame': rng.randrange(15),
        'stick_up': rng.random() < 0.25,
        'stick_down': rng.random() < 0.25,
        'stick_left': rng.random() < 0.25,
        'stick_right': rng.random() < 0.25,
        'rand_1': rng.randrange(2 ** 15),
        'rand_2': rng.randrange(2 ** 15),
        'rand_3': rng.randrange(2 ** 15),
    }
    if i % 5 == 0:
        inputs['override_vertical_range'] = rng.randrange(5)

    output = calc_batting.hit_ball(**inputs)
    if output is None:
        # The reference returns None when the ball can't reach the bat; the
        # TS port surfaces the err dict instead — normalize for comparison.
        output = {'err': 'The ball would not hit the bat with these values'}
    cases.append({'inputs': inputs, 'output': output})

target = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/batting-golden.json')
target.write_text(json.dumps(cases))
errs = sum(1 for c in cases if c['output'].get('err'))
print(f'Wrote {len(cases)} cases ({errs} error-path) to {target}')
