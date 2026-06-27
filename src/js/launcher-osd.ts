import Phaser from 'phaser';

// Bridge to the cmg launcher's in-game "Guide" OSD.
//
// On boot we advertise our custom OSD entries to the parent launcher with
//   { type: 'cmg-actions', actions: [{ id, label }] }
// (mirrors the launcher's existing cmg-plugins / cmg-cheats handshake). The
// launcher renders each as a button in the Guide; activating one posts
//   { type: 'cmg-action', id }
// back into this frame, which we turn into an in-game action — here, opening the
// Controls remapping UI (ControlsScene). The launcher may be cross-origin in a
// packaged build, so we post with '*' and guard inbound messages by window
// identity (e.source === window.parent), exactly like the cmg demos do.

const CONTROLS_ACTION = 'controls';
let wired = false;

export function initLauncherBridge(game: Phaser.Game) {
    // Advertise now and a couple of times after, in case the launcher's message
    // listener wasn't mounted on our first boot frame.
    advertise();
    setTimeout(advertise, 300);
    setTimeout(advertise, 1200);

    if (wired) return;
    wired = true;

    window.addEventListener('message', (e: MessageEvent) => {
        // Honour only the launcher that mounted us (no-op when run standalone).
        if (window.parent === window || (e.source && e.source !== window.parent)) return;
        const d: any = (e && e.data) || {};
        if (d.type === 'cmg-action' && d.id === CONTROLS_ACTION) openControls(game);
    });
}

function advertise() {
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'cmg-actions',
                actions: [{ id: CONTROLS_ACTION, label: 'Controls' }],
            }, '*');
        }
    } catch (_) { /* standalone / cross-origin parent — ignore */ }
}

function openControls(game: Phaser.Game) {
    const sm = game.scene;
    if (!sm) return;
    if (sm.isActive('ControlsScene')) return; // already open
    sm.run('ControlsScene');
}
