
import Scene1 from './Scene1.ts';


export var config : Phaser.Types.Core.GameConfig = {
    width: 683,
    height: 384,
    scene: Scene1,
    pixelArt: true,
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
    input: {
        gamepad: true
    }
};