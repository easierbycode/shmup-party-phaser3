
import Scene1 from './Scene1.ts';
import { WeaponPlugin } from './weapon-plugin';


export var config : Phaser.Types.Core.GameConfig = {
    width: 1280,
    height: 768,
    scene: Scene1,
    render: {
        pixelArt: true,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
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