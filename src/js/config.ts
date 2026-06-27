
import Scene1 from './Scene1.ts';
import BootScene from './BootScene.ts';
import ControlsScene from './ControlsScene.ts';
import { WeaponPlugin } from './weapon-plugin';


export var config : Phaser.Types.Core.GameConfig = {
    // 1680x1050 - player can go offscreen at bottom
    width: 1680,//1920,//1280,
    height: 1050,//1080,//768,
    // ControlsScene is registered but never auto-starts (only the first scene
    // boots); it is launched on demand from the launcher OSD via launcher-osd.ts.
    scene: [BootScene, Scene1, ControlsScene],
    render: {
        pixelArt: true,
    },
    scale: {
        mode: Phaser.Scale.ENVELOP
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: new URL(window.location.href).searchParams.get('debug') == 1
        }
    },
    plugins: {
        scene: [
            { key: 'WeaponPlugin', plugin: WeaponPlugin, mapping: 'weapons' }
        ]
    },
    input: {
        gamepad: true
    }
};