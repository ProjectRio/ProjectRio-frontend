# MSSB Menu Choreography Dossier

Status: DONE (pass 1). Findings appended as confirmed. Tags: [FACT] = read from source/data (cite), [INFERENCE] = reasoned, not read. "not found" = searched, nothing located.

## 0. Setup and source map

- [FACT] Decomp menu source: `/Users/matthewgreene/GitHub/mssb-dtk/src/menus/` (~46k lines; files `rep_*.c`, `main_menu.c`, `options_screen.c`, `stadium_select.c`, `challenge_file_select.c`, `captain_select/`). Headers in `include/menus/`. Note `src/menus/` has no `scene`/`cursor` file of its own.
- [FACT] Menu-sound fade helper: `src/menus/rep_01A0.c` (`startMenuSoundEffectFadeOut`, `menuSoundEffectFadeStep`), frame-driven via `insertGraphicDrawingFunction`.
- [FACT] Generic UI keyframe/animation system: `src/Unknown/File_0x8000d164.c` (`triggerDefaultHUDAction`, `UIAnimRecord` size 0x28, keys stored as 16.16 frame numbers `key << 16`, flag bits 0x20/0x08/0x04). Bezier interpolation in `src/Unknown/File_0x8000a1e8.c` (`interpolatePointsBezier_Vec2s`) and `src/Unknown/File_0x80009e94.c` (`BezierInterpolate`, `interpolatePointsUnknown`).
- [FACT] Transition code in decomp is match-level (between plays/innings), NOT menu-level: `src/game/match_setup/match_transitions.c`, `transition_init.c`. Not the menu wipe, unless proven otherwise.
- [FACT] Trig/easing hits so far in menu code: `src/menus/rep_1028.c:959,988` (`sin(obj->unk88)`), `src/menus/rep_0B08.c:1928,1955,2019,2046,2577` (`1.6f * -sin(angle)`). Not yet identified.
- [FACT] Easing-like polynomial in `src/Unknown/particle_effects.c:2168` (`t*t*(3-2t)` smoothstep) - particle code, not menu (listed for completeness).



## 2a. Input / cursor findings (main menu, decomp)

- [FACT] Cursor movement is discrete, one row per press, no tween in the logic: `src/menus/main_menu.c:613` `fn_2_1D54(int *cursor, u8 port, int count)`. UP decrements with wrap to `count-1`; DOWN increments with wrap to 0. Reads `Static_Stats_Tables.controllerInputs[port].processedInput`. Only sets an integer; nothing here animates.
- [FACT] Menu nav/confirm/cancel SFX hook: `src/menus/main_menu.c:639` `cursorSndFx(u16 button)`. Mapping: INPUT_BUTTON_A -> `sndFXStartEx(0x1B8, lbl_800EFBA4[1], 0x3F, 0)`; INPUT_BUTTON_B -> `sndFXStartEx(0x1B9, lbl_800EFBA4[2], 0x3F, 0)`; LEFT/RIGHT/UP/DOWN -> `sndFXStartEx(0x1B7, lbl_800EFBA4[0], 0x3F, 0)`; L/R trigger, X, Y -> no sound. Volume arg 0x3F on all.
- [FACT] Hooks used by menus: `src/menus/rep_01A0.c` (`startMenuSoundEffectFadeOut(u16 frames)`, frames==0 forced to 1, fade step = -volume/frames per drawing tick at priority 0x8000).
- [FACT] Screen-state machine: `src/menus/main_menu.c:187` `mainMenuScreen()`; state byte is `lbl_2_bss_20[0]`; screen id lives in `menuControlVariables+6` (u16) and a request/exit flag at `menuControlVariables+4` (u16; set to 5, 0, or per-state). Case 0 calls `initializeUnknown()`, `fn_2_1D28()`, then calls `fn_80062764(currentDrawingItem)` only if screen != 1. Case 1 and 2 wait on `fn_80022B68()`. Cases 5-10 wait on `diskReadRelated(...)` (asset streaming gates). Case 12 -> `mainMenuRelated()`.
- [FACT] No press-down state or confirm flash found yet in `cursorSndFx`; it fires on the same input frame. [INFERENCE] press feedback is therefore sound-only in this layer; visual feedback, if any, lives in the UI layout records (see Section 1/2 todo).
- [FACT] `fn_2_1DC4` (`main_menu.c:608`) is an empty `return` stub.


- [FACT] Main-menu cursor wraps 0..6 (7 rows) on UP/DOWN: `src/menus/main_menu.c` `mainMenuRelated()` case 2 (~line 420). Before moving it stores previous row in `menuCursors[1] = menuCursors[0]`; that stored "from" index is the natural hook for a slide tween. Movement uses `processedInput` (repeat-capable), while A/B confirm/cancel use `newInput` (edge-triggered, one-shot) - see `main_menu.c` case 2 lines ~380-420. Movement calls `updateCharacterSelectProcessCode(0, 0x56)` and plays SFX 0x1B7.
- [FACT] A (confirm): sets `menuControlVariables+4 = 5` (exit state), `updateCharacterSelectProcessCode(0, 0x58)`, plays SFX 0x1B8 same frame. B (cancel): `+4 = 6`, plays SFX 0x1B9 same frame, sets `sceneAlive = 0`.
- [FACT] Screen-change primitive: `src/menus/yd_step.c:26` `changeScreenVariables(u16 screen)` copies current->previous screen/state, sets `currentScreen = screen`, `currentState = 0`. Dispatch per frame is `currentScreenFunctionChooser()` (yd_step.c:~18) = `pCurrentScreenControlFunction[currentScreen]()`.
- [FACT] Process codes (the "animation trigger" bus): `src/Unknown/File_0x800625a4.c:14` `updateCharacterSelectProcessCode(int port, u8 process)` writes `gameSetUpStep.currentCharacterSelectProcess[port] = process` and zeroes `gameSetUpStep.stepFlags[0..13][port]`. Seen codes: 0x54 (enter), 0x56 (cursor move), 0x58 (confirm-exit), 0x5C (options), 0x1A/0x24-0x28 (stadium select). Not yet resolved which code is which animation.
- [FACT] UI record model (the element that animates): `include/Unknown/File_0x80034e20.h` `UIRecord` (size 0xC0): `pos` (Vec @0x48), `flags` (bit1 visible, bit2 text) @0x54, `rgba` multiplier @0x58, `frame` 16.16 @0x5C, `rate` 16.16 @0x60 (normally 0x10000 = 1 frame/tick), `playMode` @0x68 (UI_PLAY_STOP=0, FORWARD=1, BACKWARD=4), `anchor` 3x4 mtx @0x78, `textureOverride[10]` @0xAC. Pool of 864 records at `menuGraphicsStructures` (0x8039C3E0). Animated by `maybeProcessUIUpdates` (0x80035168 per header) stepping `frame += rate`.
- [FACT] Layout keyframe evaluation: `src/Unknown/File_0x8000d164.c` `triggerDefaultHUDAction`: keys are 16.16 frame numbers; per-element key entry `value` 0 = wrap (`frame %= key`), 2 = ping-pong-like loop between key[u16 at +4] and key[key]. [FACT] Keyframes are interpolated with a cubic Bezier (`BezierInterpolate`) using 4 control points built by `interpolatePointsUnknown` (Catmull-Rom-to-Bezier conversion). Constants are in `.sdata2` at `lbl_803CC400`..`lbl_803CC41C` (values TBD - see Section 6).


- [FACT] Text/label fade-in and fade-out (menu text records): `src/menus/text_636A4.c:403` `fn_2_653D4(TextScene*, TextHandleRec*)`. Alpha lives in low byte of the UI record rgba (`rgba = (rgba & ~0xFF) | fade`, line ~463).
  - Fade IN (state 4): `fade += (0xFF - fade)/4; fade++; clamp 0xFF`; done when fade>=0xFF -> state 0x25 (hold). Integer C division.
  - Fade OUT (state 6): `fade += (-fade)/4; fade--; clamp 0`.
  - Pre-show delay (state 3): timer loaded with 8 (`*(s16*)(rec+6) = 8`), decremented each tick, shows at 0 -> ~9 ticks.
  - [INFERENCE from simulation of the above integer code, run in Python]: fade-in per-tick alpha = 64, 112, 148, 175, 196, 211, 223, 232, 238, 243, 247, 250, 252, 253, 254, 255 -> reaches 255 at tick 16. Fade-out from 255 = 191, 143, 107, 80, 59, 44, 32, 23, 17, 12, 8, 5, ... -> reaches 0 at tick 16. This is an exponential ease-out (each step closes 1/4 of remaining gap, plus a +1 nudge), NOT linear. Ported to CSS this is approximately `opacity` with a cubic-bezier that drops fast then settles, ~16 frames at 60 Hz (~267 ms).
- [FACT] Menu music fade is linear: `src/Unknown/File_0x8006295c.c:53-58`, `sndFXCtrl(handle, SND_MIDICTRL_VOLUME, startVol - startVol*fadeStep/fade)` with `fadeStep++` per tick until `fade` reached. Frame count is the `fade` argument (not a constant here).
- [FACT] Menu SFX fade (linear): `src/menus/rep_01A0.c` `menuSoundEffectFadeStep`, `volume += step` with `step = -volume/frames` (frames = argument, min 1).
- [FACT] Exit / confirm-timeout dialog: `src/Unknown/File_0x8004ca6c.c:11` `exitMenu(u16 input)`. Uses a countdown in `lbl_803CB874` reloaded from `lbl_803CB878` on any input (`if (input != 0) lbl_803CB874 = lbl_803CB878`). Decrements per call; when it reaches 0 it synthesises an A press (`quiet` = timer==0 -> `input |= INPUT_BUTTON_A`) WITHOUT playing the confirm SFX. Returns 1 (A, unk02==0), 2 (A, unk02==1), 3/4 if state 4. [FACT] the timeout value lives in `lbl_803CB878`, which is NOT assigned anywhere in decomp source (only extern) - its initial value must be read from the DOL data section (TBD).
- [FACT] Screen-exit transition drawing function `fn_8004D0F0` is inserted at priority 0x3000 by `src/menus/text_0323C.c:~92` (`cssTransitionToNewScreen_maybe`, case 0) and by `src/Unknown/File_0x80047fe4.c:149`, and at priority 2 in many minigame/match files. [FACT] Its body is NOT present in src/ (no definition found by grep). Treat as "not located in decomp source yet".
- [FACT] `cssTransitionToNewScreen_maybe` (`text_0323C.c:89`) is a state machine: state 0 inserts fn_8004D0F0 @0x3000 and advances; state 1 polls `exitMenu()` and on result 3 loads demo match, sets `updateCharacterSelectProcessCode(0/1, 0x13)`, `changeScene(0xF, 6)`; result 4 returns to state 2; results 1/2 call `set803c5f77()`.


## 2b. Cursor lock and CSS step machine (captain/character select)

- [FACT] Input lock is a frame counter: `src/Unknown/File_0x80062674.c`. `makeCursorUnmovable(ch)` sets `cursorLocked[ch]=TRUE` and increments `framesUntilCursorMovable[ch]`; `makeCursorMovable(ch)` decrements it and only unlocks at 0. `resetCursorFramesTillMovable()` zeroes all 4 channels. Symbols at `config/GYQE01/symbols.txt`: makeCursorMovable=0x80062674, makeCursorUnmovable=0x800626EC, resetCursorFramesTillMovable=0x80062744, framesUntilCursorMovable=.bss 0x803C663C size 0x74.
- [FACT] Lock is released by animation completion, not by a timer. Primitive: `src/Unknown/orderchange.c:241` `maybeCheckAndResetGrapicsElement(scene, handle, frame)`: if `(record->frame >> 16) == frame` it sets `playMode = UI_PLAY_STOP` and returns TRUE. Symbol 0x80042DA8, size 0x40. So "wait for anim to reach integer frame N, then freeze there".
- [FACT] CSS per-channel step machine `gameSetUpStep[channel + 0xD]` (values 0 clear, 1 active, 2 done) in `src/menus/text_8082C.c`:
  - `fn_2_808D8` (step clear -> start): plays icon records 0x89 FORWARD from frame 0, 0x8B BACKWARD from frame 10 (`10<<16`), 0x80 FORWARD from 0, 0x78/0x7C FORWARD from 0; then `makeCursorUnmovable` and step=1.
  - `fn_2_8082C` (step active): waits until record 0x89 reaches frame 5 AND record 0x8B reaches frame 10; then `makeCursorMovable`, step=2.
  - `fn_2_80C2C` (exit/clear): sets records channel+0 and +2 to frame 20 BACKWARD, channel+4 to frame 30 BACKWARD, several others BACKWARD; then makeCursorUnmovable, step=1.
  - `fn_2_80B5C`/`fn_2_80E0C`: wait on frame 0/10 (count == 3) and frame 20/10/5 combos before unlocking.
  - [FACT] Frame numbers in these waits are integer keyframe indices (the layout keyframe timeline), not milliseconds.
- [INFERENCE] The "cursor movement" in CSS is therefore a layout keyframe animation (Bezier interpolated between keyframes) that is started by writing `frame` (16.16) and `playMode`, and the cursor is locked until that play reaches its target keyframe.

## 2c. Main menu row cursor (7-row list): keyframe choreography

Source: `src/menus/text_744C8.c` (`fn_2_747FC` process-code switch; `gfxNodeSetU32` writes record +0x5C frame, `gfxNodeSetU8` writes +0x68 playMode) and `src/menus/text_71EC4.c` (`fn_2_73EFC`, `fn_2_73CBC`, `fn_2_73BF0`, `fn_2_73B94`, `fn_2_73B54`). Row count 7 matches `main_menu.c` cursor wrap 0..6.

- [FACT] Record handle map used by the main menu (scene firstHandle + offset): row labels `row+3` (rows 0-6); glow/secondary `row+0x18`; cursor pulse `row+0x11`; icon pair `0x20` (current) and `0x21` (previous).
- [FACT] Cursor move keyframe tables (`fn_2_73BF0` start frame, `fn_2_73B94` target frame, `fn_2_73B54` playMode). Frame numbers are keyframe indices. `mainMenuCursorShown` = previously shown row. `Static_Stats_Tables[0x4752]` is a variant flag (set to 1 on the move-request path, selects the alternate start frame):
  - Moving DOWN (shown <= new row, normal wrap-free): start 0xF (15) [variant 0x17=23], target 0x1D (29), playMode FORWARD (1).
  - Moving UP (shown > new row): start 0x1E (30) [variant 0x26=38], target 0x2C (44), playMode FORWARD (1).
  - Wrap 6 -> 0 (shown == 6, new == 0): start 0 [variant 8], target 0xE (14), playMode FORWARD.
  - Wrap 0 -> 6 (shown == 0, new == 6): start 0x36 (54), target 0x2D (45), playMode BACKWARD (4).
  - [FACT] So a normal row step is 14 keyframes (15->29 or 30->44). At 1 keyframe per draw tick (rate 0x10000 in `File_0x80034f50.c:49`, advance in `src/Unknown/File_0x80035168.c:171`) that is 14 ticks, ~233 ms at 60 Hz [INFERENCE: 60 Hz is the NTSC rate; not verified from the DOL].
- [FACT] Cursor pulse / idle loop: state 0x57 (`fn_2_747FC`, `text_744C8.c`) sets record `cursor+0x11` to frame 14 (0xE0000) playMode FORWARD, and when it reaches frame 55 (0x37) via `maybeCheckAndResetGrapicsElement` it resets to 14 and replays. So the selected row has a 41-keyframe repeating loop (14..55) [FACT of the loop; INFERENCE that this is the visible 'breathing' highlight].
- [FACT] Confirm/press pulse: state 0x58 (on A) sets `cursor+0x11` to frame 55 (0x370000) FORWARD, locks input (`makeCursorUnmovable`), waits for frame 65 (0x41), then `makeCursorMovable`. A press-to-confirm pulse of 10 keyframes (55 -> 65, ~167 ms at 60 Hz).
- [FACT] Icon swap on move: `fixedRecord(0x20)` frame 0 FORWARD and `fixedRecord(0x21)` frame 10 (0xA0000) FORWARD, waits for 0x20 to reach frame 10 (`fn_2_73CBC`). Hard-stop on arrival: `fn_2_73CBC` waits for row record `row+3` at its target frame and `cursor+0x11` at frame 14 and `0x20` at frame 10, then sets state 2 and `updateCharacterSelectProcessCode(0, 0x57)` (the idle loop above).
- [FACT] Press-down state: none found. Input on A sets state 0x58 directly; no separate pressed-frame. [INFERENCE] The 10-frame 55->65 pulse on confirm is the only press feedback in this scene.
- [FACT] Cursor input lock during move: `makeCursorUnmovable(0)` before the move, `makeCursorMovable(0)` only after the target frame is reached (see 2b). Input is thus ignored during the 14-tick row move.

## 1. Screen transitions (summary)

- [FACT] No menu-level iris/wipe/slide routine was located in decomp source. Match-level transitions (`src/game/match_setup/match_transitions.c`, `transition_init.c`) are not menu wipes.
- [FACT] Screen exit drawing hook is `fn_8004D0F0`, inserted at priority 0x3000 (`src/menus/text_0323C.c` CSS exit) and 0x2 elsewhere. Symbol `config/GYQE01/symbols.txt:1940` at 0x8004D0F0 size 0x370. Body NOT decompiled in src/. Not decoded: the system objdump has no PowerPC support, so I could not disassemble it. [NOT FOUND: its effect/duration.]
- [FACT] Screen changes are instant state swaps (`changeScreenVariables`, `src/menus/yd_step.c:26`); the visual "transition" is the record fade below plus the layout keyframes.
- [FACT] `possiblyTransitionBlackScreen` (`src/Unknown/File_0x80052f98.c`) is a 3D camera/frustum setup, not a menu wipe.
- [NOT EXAMINED] Transition textures in 1753/1756/2513/2514 were not checked for iris or mask art in this pass.

## 1b. (old heading below)

## 2. Cursor and focus behaviour

## 3. Item enter/exit staging (summary)

- [FACT] Main-menu enter (`fn_2_747FC` case 0x54, `text_744C8.c`): selected row record set frame 0 FORWARD; other rows flagged invisible (`flags &= ~2`); no per-index delay constant in this code. [FACT] No loop with `i * delay` found for menu list entry in src/menus.
- [FACT] Other menu list loops (`text_8782C.c:363`, `text_78F78.c`) assign frames from data (`v << 16`), not delays.
- [INFERENCE] Any stagger lives in the layout keyframe timelines, not in code. Not verified: the layout keyframe data was not decoded here.

## 3b. (old heading below)

## 4. Input feedback (summary)

- [FACT] SFX hook: `cursorSndFx` (`src/menus/main_menu.c:639`): nav 0x1B7, confirm 0x1B8 (A), cancel 0x1B9 (B), all volume 0x3F, sound bank entries from `lbl_800EFBA4[0..2]`.
- [FACT] Edge vs repeat: A/B use `newInput` (edge), nav uses `processedInput` (repeat-capable). Source `main_menu.c` case 2.
- [FACT] Press/confirm visual: main-menu state 0x58 plays cursor record 55->65 (10 keyframes) FORWARD, then re-enables input (`text_744C8.c`).
- [FACT] Rejection shake: not found. Nothing in the menu code writes a shake offset that I read.
- [FACT] Confirm flash as a separate record: not found; the 55->65 pulse is the only one.

## 4b. (old heading below)

## 5. Idle and attract behaviour (summary)

- [FACT] `exitMenu` (`src/Unknown/File_0x8004ca6c.c:11`) has a countdown `lbl_803CB874` reloaded from `lbl_803CB878` on any input; at 0 it synthesises A. The DOL value at 0x803CB878 is 0xFFFFFFFF (read with `/private/.../scratchpad/scripts/dol_read.py`). Signed -1 means the countdown never reaches 0, so the auto-confirm is effectively DISABLED unless something writes the variable. [FACT] No writer found in decomp src.
- [FACT] Title screen (`src/menus/text_8ED4C.c:34`, `titleScreen`): result 3 runs `fn_2_8ED4C` (CPU-vs-CPU demo: GAME_TYPE_DEMO, 3 innings) then `changeScene(4,6)`. [NOT FOUND] the timer that sets result 3 (`fn_8006C0D0` body not in src; writer of `TitlePrompt.result` not found).
- [FACT] No breathing cursor timer found beyond the 14..55 keyframe loop on the selected row (see 2c).
- [FACT] rep_1028.c `fn_2_90DE4`/`fn_2_90EC4`: `v = K1 * -sin(unk88); unk88 += K2` oscillator. Constants are REL rodata (lbl_2_rodata_10B8/10BC), not read. Object identity not determined.

## 5b. (old heading below)

## 6. Easing and interpolation (summary)

- [FACT] Keyframe curve: standard cubic Bernstein Bezier. `src/Unknown/File_0x80009e94.c` `BezierInterpolate`. Weights (checked by hand): w0=(1-t)^3, w1=3t(1-t)^2, w2=3t^2(1-t), w3=t^3.
- [FACT] Control-point constants (DOL .sdata2, read via dol_read.py): lbl_803CC400=7, 404=6, 408=12, 40C=-1, 410=3, 414=-3, 418=1, 41C=-6. `interpolatePointsUnknown` builds neighbour control points with divisors 6 and 12 (uniform cubic B-spline style, [INFERENCE] naming).
- [FACT] Text record fade: integer exponential ease, see 2 (`text_636A4.c:403`). Fade-in alpha by tick: 64,112,148,175,196,211,223,232,238,243,247,250,252,253,254,255 (16 ticks). Fade-out: 191,143,107,80,59,44,32,23,17,12,8,5,... (16 ticks to 0). Simulated in Python from the decomp integer code.
- [FACT] Linear fades: menu music (`File_0x8006295c.c:53-58`), menu SFX (`rep_01A0.c`).
- [FACT] Cursor motion is keyframe interpolation, not a math tween: `frame += rate` per tick (`File_0x80035168.c:171`), rate 0x10000 default.
- [FACT] Smoothstep `t*t*(3-2t)` exists only in particle_effects.c:2168. Not used by menus. No lerp/spring in menu code found.
- [INFERENCE] 60 Hz tick rate is assumed (NTSC), not verified. At 60 Hz: row step 14 ticks ~233 ms; confirm pulse 10 ticks ~167 ms; text fade 16 ticks ~267 ms.

## 6b. (old heading below)

## 7. Summary of most useful findings
