
import Scene1 from './Scene1.ts';
import { WeaponPlugin } from './weapon-plugin';


export var config : Phaser.Types.Core.GameConfig = {
    // 1680x1050 - player can go offscreen at bottom
    width: 1680,//1920,//1280,
    height: 1050,//1080,//768,
    scene: Scene1,
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