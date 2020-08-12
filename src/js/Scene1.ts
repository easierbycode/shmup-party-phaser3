
import {config} from './config.ts';
import player from '../assets/images/trooper.png';
import Player from './player.ts';
import scorchedEarth from '../assets/images/scorched-earth.png';
import Phaser from 'phaser';


export default class Scene1 extends Phaser.Scene {

    constructor() {
        super({ key: 'Scene1' });
    }

    preload() {
        this.load.image( 'bg', scorchedEarth );
        this.load.image( 'player', player );
    }

    create() {
        this.player;

        this.add.tileSprite( 0, 0, 2000, 2000, 'bg' ).setOrigin( 0 );

        this.cameras.main.setBounds( 0, 0, 2000, 2000 );
        this.physics.world.setBounds( 0, 0, 2000, 2000 );
        
        this.input.gamepad.once('down', (gamepad, btn, idx) => {
            this.player = new Player( gamepad, this, config.width / 2, config.height / 2 );
            this.cameras.main.startFollow( this.player, true, 0.05, 0.05 );
        });
    }

    update() {
        if ( !this.player )  return;

        this.player.update();
    }
}