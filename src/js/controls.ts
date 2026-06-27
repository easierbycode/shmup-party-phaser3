import Phaser from 'phaser';

// controls.ts — remappable action→button bindings.
//
// Bindings are shared across all players (every pad runs the same scheme) and
// persisted to localStorage. The in-game Controls UI (ControlsScene) edits them;
// Player reads them on each gamepad button-down to dispatch the bound action.
// An action can map to several buttons ("button(s)") — e.g. Dash on L1 + R1.

export type ActionId = 'dash' | 'reverseBoost' | 'prevWeapon' | 'nextWeapon' | 'restart' | 'pause';

export interface ActionDef {
    id: ActionId;
    label: string;
    hint: string;
    defaults: number[]; // W3C standard-mapping button indices
}

// Order = display order in the Controls UI.
export const ACTIONS: ActionDef[] = [
    { id: 'dash',         label: 'Dash',          hint: 'Barrier dash',        defaults: [5] }, // R1
    { id: 'reverseBoost', label: 'Reverse Boost', hint: 'Shoot + recoil back',  defaults: [4] }, // L1
    { id: 'prevWeapon',   label: 'Prev Weapon',   hint: 'Cycle weapon back',    defaults: [6] }, // L2
    { id: 'nextWeapon',   label: 'Next Weapon',   hint: 'Cycle weapon fwd',     defaults: [7] }, // R2
    { id: 'restart',      label: 'Restart',       hint: 'Restart the round',    defaults: [8] }, // SELECT
    { id: 'pause',        label: 'Pause',         hint: 'Pause / resume',       defaults: [9] }, // START
];

// Short glyph labels for standard-mapping button indices, kept generic so they
// read on any pad. Index → label.
export const BUTTON_LABELS: Record<number, string> = {
    0: 'A', 1: 'B', 2: 'X', 3: 'Y',
    4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2',
    8: 'SEL', 9: 'STA', 10: 'L3', 11: 'R3',
    12: 'D↑', 13: 'D↓', 14: 'D←', 15: 'D→', 16: 'HM',
};

export function buttonLabel(idx: number): string {
    return BUTTON_LABELS[idx] ?? `B${idx}`;
}

// v2: L1 moved from Dash to the new Reverse Boost (dash is R1 only now). Bumping
// the key drops any v1 binding where dash still held L1, which would otherwise
// fire both Dash and Reverse Boost on L1.
const STORAGE_KEY = 'shmup-controls-v2';
const MAX_PER_ACTION = 4;

export type Bindings = Record<ActionId, number[]>;

function defaultBindings(): Bindings {
    const b = {} as Bindings;
    for (const a of ACTIONS) b[a.id] = [...a.defaults];
    return b;
}

// Harden whatever came back from storage: keep only valid integer indices, drop
// dupes, cap the count, and fall back to defaults for any missing/garbled action.
function sanitize(raw: any): Bindings {
    const b = defaultBindings();
    if (raw && typeof raw === 'object') {
        for (const a of ACTIONS) {
            const v = (raw as any)[a.id];
            if (Array.isArray(v)) {
                b[a.id] = Array.from(
                    new Set(v.filter((n: any) => Number.isInteger(n) && n >= 0 && n <= 31))
                ).slice(0, MAX_PER_ACTION) as number[];
            }
        }
    }
    return b;
}

let bindings: Bindings = load();

function load(): Bindings {
    try { return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
    catch (_) { return defaultBindings(); }
}

function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings)); } catch (_) { /* private mode */ }
}

export function getBinding(id: ActionId): number[] {
    return bindings[id] ?? [];
}

// Append a button to an action (replace=false) or replace the whole binding with
// just this button (replace=true). De-duped and capped. When the cap is hit on
// an append, keep the newest entries (slice off the front) so the just-bound
// button always takes effect rather than being silently dropped. Persists.
export function bindButton(id: ActionId, idx: number, replace = false) {
    const cur = replace ? [] : getBinding(id);
    bindings[id] = Array.from(new Set([...cur, idx])).slice(-MAX_PER_ACTION);
    persist();
}

export function resetBinding(id: ActionId) {
    const def = ACTIONS.find((a) => a.id === id);
    bindings[id] = def ? [...def.defaults] : [];
    persist();
}

export function resetAll() {
    bindings = defaultBindings();
    persist();
}

// Reverse lookup: which actions fire for a pressed button index. A button may be
// bound to more than one action, so return every match.
export function actionsForButton(idx: number): ActionId[] {
    const out: ActionId[] = [];
    for (const a of ACTIONS) if (bindings[a.id]?.includes(idx)) out.push(a.id);
    return out;
}

// Shared flag so Player ignores gamepad button-downs while the Controls UI is up
// (the menu drives its own navigation off the very same buttons).
export const ControlsState = { open: false };

// Some pads report non-standard button indices. The Switch-Online SNES pad
// (id "SNES Controller …", 057e:2017) sends ZR as button 15 — which the W3C
// standard layout calls "d-pad right" — instead of the standard R2 = 7, so its
// trigger never matches the default Next-Weapon binding. For SNES pads we alias
// the repurposed index back to the standard one the bindings use, so the trigger
// works without remapping (and still follows R2 if the user rebinds it). Gated
// to SNES pads in Player so a standard pad's real d-pad-right is unaffected.
const SNES_BUTTON_ALIAS: Record<number, number> = {
    15: 7, // ZR → R2 (Next Weapon)
};

export function aliasSnesButton(idx: number): number {
    return SNES_BUTTON_ALIAS[idx] ?? idx;
}

// Analog triggers (L2/R2 = standard indices 6/7) default to a Phaser press
// threshold of 1.0, so a 'down' event only fires on a *full* pull — and some
// pads top out just under 1.0 and never fire. Lower those two buttons to 0.5 so
// the default Prev/Next-Weapon bindings register on a normal pull. Idempotent;
// digital buttons are unaffected. Call once per pad (Player + the Controls UI).
export function lowerTriggerThresholds(pad: Phaser.Input.Gamepad.Gamepad) {
    for (const i of [6, 7]) {
        const btn = pad?.buttons?.[i];
        if (btn) btn.threshold = 0.5;
    }
}
