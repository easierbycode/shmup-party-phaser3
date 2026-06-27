import Phaser from 'phaser';
import {
    ACTIONS,
    ActionDef,
    buttonLabel,
    getBinding,
    bindButton,
    resetBinding,
    resetAll,
    ControlsState,
    lowerTriggerThresholds,
} from './controls.ts';

import panelImg from '../assets/images/gfx/panel-medium.png';
import listboxPanelImg from '../assets/images/gfx/listbox-panel.png';
import lineSelectorImg from '../assets/images/gfx/listbox-line-selector.png';
import selectorSquareImg from '../assets/images/gfx/selector-square.png';
import padCircleImg from '../assets/images/gfx/virtual-gamepad-circle.png';
import padDotImg from '../assets/images/gfx/virtual-gamepad-dot.png';
import rulerImg from '../assets/images/gfx/horizontal-ruler.png';

// Standard-mapping button indices used for menu navigation.
const BTN = { A: 0, B: 1, X: 2, Y: 3, DPAD_UP: 12, DPAD_DOWN: 13, START: 9 };

interface Row {
    def: ActionDef;
    y: number;
    bar: Phaser.GameObjects.Image;        // cyan selection bar (listbox-line-selector)
    frame: Phaser.GameObjects.NineSlice;  // gold focus frame (selector-square)
    label: Phaser.GameObjects.Text;
    badges: Phaser.GameObjects.Container;  // holds the per-button glyph badges
    prompt: Phaser.GameObjects.Text;       // "PRESS A BUTTON…" while capturing
    hit: Phaser.GameObjects.Zone;
}

// In-game Controls UI. Launched on top of the (paused) gameplay scene when the
// player picks "Controls" from the launcher's Guide OSD — see launcher-osd.ts.
// Built entirely from the cmg /gfx UI kit (blue sci-fi panel + cyan list bar +
// gold focus frame + virtual-gamepad button glyphs).
export default class ControlsScene extends Phaser.Scene {
    private rows: Row[] = [];
    private sel = 0;
    private capturing = false;
    private captureReplace = true;
    private closing = false;
    private prevBtn: Record<number, boolean[]> = {};
    private prevNav: Record<number, { up: boolean; down: boolean }> = {};
    private driver: number | null = null; // the one pad that owns menu input
    private footer!: Phaser.GameObjects.Text;
    private pulse?: Phaser.Tweens.Tween;
    private W = 0;
    private H = 0;

    constructor() {
        super({ key: 'ControlsScene' });
    }

    preload() {
        this.load.image('ui-panel', panelImg);
        this.load.image('ui-listbox', listboxPanelImg);
        this.load.image('ui-line-selector', lineSelectorImg);
        this.load.image('ui-selector-square', selectorSquareImg);
        this.load.image('ui-pad-circle', padCircleImg);
        this.load.image('ui-pad-dot', padDotImg);
        this.load.image('ui-ruler', rulerImg);
    }

    create() {
        // The scene instance is REUSED across open/close cycles (run → stop →
        // run re-runs create() on the same object), so reset every per-open field
        // here. `rows` especially: without this it grows by five each reopen and
        // refresh()/moveSel() end up walking destroyed GameObjects from old opens.
        this.closing = false;
        this.capturing = false;
        this.sel = 0;
        this.driver = null;
        this.rows = [];
        this.prevBtn = {};
        this.prevNav = {};
        this.pulse = undefined;
        ControlsState.open = true;

        // Freeze the gameplay underneath; the panel renders over the last frame.
        if (this.scene.isActive('Scene1')) this.scene.pause('Scene1');

        const W = this.W = this.scale.width;
        const H = this.H = this.scale.height;
        const cx = W / 2;
        const cy = H / 2;

        // Dim scrim (also eats stray pointer taps behind the panel).
        this.add.rectangle(cx, cy, W, H, 0x02060b, 0.66).setInteractive();

        const PANEL_W = 1040;
        const PANEL_H = 800;
        // panel-medium is 1447×963 with a ~80px glowing chrome border + chamfers.
        this.add.nineslice(cx, cy, 'ui-panel', undefined, PANEL_W, PANEL_H, 80, 80, 80, 80);

        const innerL = cx - PANEL_W / 2 + 90;
        const innerR = cx + PANEL_W / 2 - 90;
        const top = cy - PANEL_H / 2;

        // ── Header ─────────────────────────────────────────────────────────────
        this.add.text(cx, top + 86, 'CONTROLS', {
            fontFamily: 'monospace', fontSize: '52px', fontStyle: 'bold',
            color: '#e6fbff', stroke: '#0a4f78', strokeThickness: 6,
        }).setOrigin(0.5).setShadow(0, 0, '#39c8ff', 16, true, true);

        this.add.text(cx, top + 134, 'MAP ACTIONS TO YOUR CONTROLLER', {
            fontFamily: 'monospace', fontSize: '20px', color: '#7fb8d6', letterSpacing: 4,
        } as any).setOrigin(0.5);

        this.add.image(cx, top + 168, 'ui-ruler')
            .setDisplaySize(innerR - innerL, 6).setAlpha(0.8);

        // ── List of action rows ─────────────────────────────────────────────────
        const listTop = top + 210;
        const rowH = 82;
        const rowGap = 14;
        const rowW = innerR - innerL;

        ACTIONS.forEach((def, i) => {
            const y = listTop + i * (rowH + rowGap) + rowH / 2;

            // Per-row dark list panel so unselected rows still read as a listbox.
            this.add.nineslice(cx, y, 'ui-listbox', undefined, rowW, rowH, 16, 16, 16, 16)
                .setAlpha(0.5);

            // Cyan selection bar (listbox-line-selector) — only the active row.
            const bar = this.add.image(cx, y, 'ui-line-selector')
                .setDisplaySize(rowW - 10, rowH - 12).setAlpha(0).setTint(0x6fe3ff);

            // Gold focus frame (selector-square) around the active row.
            const frame = this.add.nineslice(cx, y, 'ui-selector-square', undefined, rowW, rowH, 40, 40, 40, 40)
                .setVisible(false);

            const label = this.add.text(innerL + 26, y, def.label, {
                fontFamily: 'monospace', fontSize: '30px', fontStyle: 'bold', color: '#bfe9ff',
            }).setOrigin(0, 0.5);

            const badges = this.add.container(0, y);

            const prompt = this.add.text(innerR - 26, y, 'PRESS A BUTTON…', {
                fontFamily: 'monospace', fontSize: '24px', fontStyle: 'bold', color: '#ffd23c',
            }).setOrigin(1, 0.5).setVisible(false);

            // Pointer affordance: hover/tap to select, tap selected row to rebind.
            const hit = this.add.zone(cx, y, rowW, rowH).setInteractive({ useHandCursor: true });
            hit.on('pointerover', () => { if (!this.capturing) { this.sel = i; this.refresh(); } });
            hit.on('pointerdown', () => {
                if (this.capturing) return;
                if (this.sel === i) this.startCapture(true);
                else { this.sel = i; this.refresh(); }
            });

            this.rows.push({ def, y, bar, frame, label, badges, prompt, hit });
        });

        // ── Footer prompts ───────────────────────────────────────────────────────
        this.footer = this.add.text(cx, top + PANEL_H - 56, '', {
            fontFamily: 'monospace', fontSize: '22px', color: '#8fd0ec',
        }).setOrigin(0.5);

        // Header affordances: RESET ALL (left) and a pointer/touch close (right) —
        // so touch users (who reach this via the launcher's two-finger gesture and
        // have no gamepad B / keyboard ESC) can still dismiss the panel.
        const resetBtn = this.add.text(innerL + 4, top + 52, 'RESET ALL', {
            fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold', color: '#9fe0ff',
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
        resetBtn.on('pointerover', () => resetBtn.setColor('#ffffff'));
        resetBtn.on('pointerout', () => resetBtn.setColor('#9fe0ff'));
        resetBtn.on('pointerdown', () => { if (!this.capturing) { resetAll(); this.refresh(); } });

        const closeBtn = this.add.text(innerR + 4, top + 52, '✕', {
            fontFamily: 'monospace', fontSize: '30px', fontStyle: 'bold', color: '#9fe0ff',
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#9fe0ff'));
        closeBtn.on('pointerdown', () => this.close());

        // Keyboard fallback (nav/close/reset); button capture still comes from a pad.
        this.input.keyboard?.on('keydown-UP', () => { if (!this.capturing) this.moveSel(-1); });
        this.input.keyboard?.on('keydown-DOWN', () => { if (!this.capturing) this.moveSel(1); });
        this.input.keyboard?.on('keydown-ENTER', () => { if (!this.capturing) this.startCapture(true); });
        this.input.keyboard?.on('keydown-BACKSPACE', () => { if (!this.capturing) this.resetRow(); });
        this.input.keyboard?.on('keydown-ESC', () => { this.capturing ? this.cancelCapture() : this.close(); });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { ControlsState.open = false; });

        this.refresh();
    }

    private getPads(): Phaser.Input.Gamepad.Gamepad[] {
        const gp = this.input.gamepad;
        if (!gp) return [];
        return gp.gamepads.filter((p) => p && p.connected) as Phaser.Input.Gamepad.Gamepad[];
    }

    update() {
        if (this.closing) return;

        const pads = this.getPads();
        // Release the lock if the pad that was driving the menu went away.
        if (this.driver !== null && !pads.some((p) => p.index === this.driver)) this.driver = null;

        for (const pad of pads) {
            const idx = pad.index;
            const cur: boolean[] = [];
            for (let b = 0; b <= 16; b++) cur[b] = !!pad.buttons[b]?.pressed;

            const sy = pad.leftStick ? pad.leftStick.y : 0;
            const navUp = cur[BTN.DPAD_UP] || sy < -0.5;
            const navDown = cur[BTN.DPAD_DOWN] || sy > 0.5;

            // First sight of a pad (menu just opened): seed its edge-latch from the
            // live physical state and act on nothing this frame. A button still
            // held from the launcher activation (the A that opened the menu) is
            // thus baseline, not a fresh press, so we don't auto-enter capture.
            if (!(idx in this.prevBtn)) {
                lowerTriggerThresholds(pad);
                this.prevBtn[idx] = cur;
                this.prevNav[idx] = { up: navUp, down: navDown };
                continue;
            }

            const prev = this.prevBtn[idx];
            const pnav = this.prevNav[idx];

            // Did this pad produce any fresh edge this frame?
            let edge = (navUp && !pnav.up) || (navDown && !pnav.down);
            if (!edge) for (let b = 0; b <= 16; b++) { if (cur[b] && !prev[b]) { edge = true; break; } }

            // Latch the menu to the first pad that interacts, then ignore the rest
            // — so in 2-player a second controller can't move the cursor or hijack
            // an in-progress rebind.
            if (edge && this.driver === null) this.driver = idx;

            if (this.driver === null || this.driver === idx) {
                if (this.capturing) {
                    // First fresh button-down binds; B cancels.
                    for (let b = 0; b <= 16; b++) {
                        if (cur[b] && !prev[b]) {
                            if (b === BTN.B) this.cancelCapture();
                            else this.commitCapture(b);
                            break;
                        }
                    }
                } else {
                    if (navUp && !pnav.up) this.moveSel(-1);
                    else if (navDown && !pnav.down) this.moveSel(1);
                    else if (cur[BTN.A] && !prev[BTN.A]) this.startCapture(true);   // rebind (replace)
                    else if (cur[BTN.Y] && !prev[BTN.Y]) this.startCapture(false);  // add another button
                    else if (cur[BTN.X] && !prev[BTN.X]) this.resetRow();           // reset to default
                    else if (cur[BTN.B] && !prev[BTN.B]) this.close();              // back
                    else if (cur[BTN.START] && !prev[BTN.START]) this.close();      // save & close
                }
            }

            this.prevBtn[idx] = cur;
            this.prevNav[idx] = { up: navUp, down: navDown };
        }
    }

    private moveSel(dir: number) {
        this.sel = Phaser.Math.Wrap(this.sel + dir, 0, this.rows.length);
        this.refresh();
    }

    private startCapture(replace: boolean) {
        this.capturing = true;
        this.captureReplace = replace;
        this.refresh();
    }

    private cancelCapture() {
        this.capturing = false;
        this.refresh();
    }

    private commitCapture(buttonIndex: number) {
        const row = this.rows[this.sel];
        if (row) bindButton(row.def.id, buttonIndex, this.captureReplace);
        this.capturing = false;
        this.refresh();
    }

    private resetRow() {
        const row = this.rows[this.sel];
        if (row) resetBinding(row.def.id);
        this.refresh();
    }

    // Re-skin every row to the current selection / capture / binding state.
    private refresh() {
        this.rows.forEach((row, i) => {
            const active = i === this.sel;
            row.bar.setAlpha(active ? 0.32 : 0);
            row.frame.setVisible(active);
            row.label.setColor(active ? '#ffffff' : '#bfe9ff');
            row.prompt.setVisible(active && this.capturing);
            this.drawBadges(row, active);
        });

        const active = this.rows[this.sel];
        if (active) {
            // Pulse the gold frame normally; pulse the prompt while capturing.
            this.pulse?.remove();
            this.pulse = this.tweens.add({
                targets: this.capturing ? active.prompt : active.frame,
                alpha: { from: 1, to: this.capturing ? 0.25 : 0.55 },
                duration: 480, yoyo: true, repeat: -1,
            });
        }

        this.footer.setText(this.capturing
            ? 'PRESS ANY BUTTON TO BIND      Ⓑ CANCEL'
            : 'Ⓐ REBIND    Ⓨ ADD    Ⓧ RESET    Ⓑ CLOSE');
    }

    // Lay out the bound-button glyphs (virtual-gamepad-circle + label) for a row,
    // right-aligned. Hidden on the active row while capturing (prompt shows instead).
    private drawBadges(row: Row, active: boolean) {
        row.badges.removeAll(true);
        if (active && this.capturing) return;

        const binds = getBinding(row.def.id);
        const PANEL_W = 1040;
        const innerR = this.W / 2 + PANEL_W / 2 - 90;
        const size = 56;
        const gap = 14;

        // Right-to-left placement.
        let x = innerR - 26;
        const items = binds.length ? binds.slice() : [-1]; // -1 → "unbound" marker
        for (let k = items.length - 1; k >= 0; k--) {
            const idx = items[k];
            const bx = x - size / 2;
            if (idx < 0) {
                const t = this.add.text(0, 0, '—', {
                    fontFamily: 'monospace', fontSize: '30px', color: '#5e7f93',
                }).setOrigin(1, 0.5).setPosition(x, 0);
                row.badges.add(t);
            } else {
                const ring = this.add.image(bx, 0, 'ui-pad-circle').setDisplaySize(size, size);
                const txt = this.add.text(bx, 0, buttonLabel(idx), {
                    fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold', color: '#eaffff',
                }).setOrigin(0.5);
                row.badges.add(ring);
                row.badges.add(txt);
            }
            x -= size + gap;
        }
    }

    private close() {
        if (this.closing) return;
        this.closing = true;
        ControlsState.open = false;
        this.pulse?.remove();
        if (this.scene.isPaused('Scene1')) this.scene.resume('Scene1');
        this.scene.stop();
    }
}
