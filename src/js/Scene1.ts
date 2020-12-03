
import {config} from './config.ts';
import Player from './player.ts';
import Phaser from 'phaser';
import Zombie from './zombie';
import Alien from './alien';

const files = [
    {
        type: 'image',
        key: 'logo',
        url: 'assets/images/shmup-party-logo.png'
    }
];


export default class Scene1 extends Phaser.Scene {

    constructor() {
        super({ 
            key: 'Scene1',
            pack: { files }
        });
    }

    init( data ) {
        this.add.sprite( config.width / 2, config.height / 2, 'logo' );
    }

    preload() {
        this.load.image( 
            'bg', 
            require( '../assets/images/scorched-earth.png' ) 
        );
        this.load.image( 
            'player', 
            require( '../assets/images/trooper.png' ) 
        );
        this.load.spritesheet(
            'alien-move', 
            require('../assets/images/alien-move.png'),
            { frameWidth:72, frameHeight:72 }
        );
        this.load.spritesheet(
            'pacman-bullet', 
            require('../assets/images/pacman-spritesheet.png'),
            { frameWidth:32, frameHeight:32 }
        );
        this.load.spritesheet(
            'zombie-move', 
            require('../assets/images/zombie-move.png'),
            { frameWidth:72, frameHeight:72 }
        );
        this.load.spritesheet(
            'zombie-die', 
            require('../assets/images/zombie-die.png'),
            { frameWidth:72, frameHeight:72 }
        );
    }

    create() {        
        this.player;

        this.add.tileSprite( 0, 0, 2000, 2000, 'bg' ).setOrigin( 0 );

        this.cameras.main.setBounds( 0, 0, 2000, 2000 );
        this.physics.world.setBounds( 0, 0, 2000, 2000 );

        let zombie = new Zombie( this, 50, 50 );
        let alien = new Alien( this, config.width / 2, 50 );
        let baddies = this.add.group([alien, zombie]);

        this.input.gamepad.once('down', (gamepad, btn, idx) => {
            this.player = new Player( gamepad, this, config.width / 2, config.height / 2 );
            
            this.cameras.main.startFollow( this.player, true, 0.05, 0.05 );
            
            this.physics.add.overlap(
                baddies, 
                this.player.bullets, 
                (baddie, bullet) => {
                    if ( !baddie.active )  return;
                    baddies.killAndHide( baddie );
                }
            );
        });

        this.physics.add.collider( alien, zombie );
    }

}