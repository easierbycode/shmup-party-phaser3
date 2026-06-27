import Phaser from 'phaser';
import { ensureControlsFont } from './controls';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        // Start fetching the Controls-UI web font (Orbitron) at boot so it's
        // ready by the time the player opens the panel (canvas text won't fetch
        // it on its own — see ensureControlsFont).
        ensureControlsFont();
    }

    preload() {
        let assetPath = '';
        if (window.location.pathname.includes('shmup-party-phaser3')) {
            assetPath = '/shmup-party-phaser3/';
        } else if (window.location.pathname.includes('android_asset')) {
            assetPath = '/android_asset/www/';
        }
        this.load.setBaseURL(assetPath);

        this.load.image('logo', 'assets/images/shmup-party-logo.png');
        this.load.image('loader', 'assets/images/loader.png');
    }

    create() {
        this.scene.start('Scene1');
    }
}
