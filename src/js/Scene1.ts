
import Player from './player.ts';
import Phaser from 'phaser';
import Zombie from './zombie';
import Alien from './alien';
import WAVE1 from './wave1';
import { config } from './config.ts';

const files = [
    {
        type: 'image',
        key: 'logo',
        url: 'assets/images/shmup-party-logo.png'
    },
    {
        type: 'image',
        key: 'loader',
        url: 'assets/images/loader.png'
    }
];


export default class Scene1 extends Phaser.Scene {

    constructor() {
        super({
            key: 'Scene1',
            pack: { files }
        });
    }

    init(data) {
        this.add.sprite(config.width / 2, config.height / 2, 'logo');
        this.loadingBar = this.add.sprite(config.width / 2, config.height / 2 + 128, 'loader');
    }

    preload() {
        this.load.on('progress', (value) => {
            this.loadingBar.setScale(value, 1);
        });
        this.load.image(
            'bg',
            require('../assets/images/scorched-earth.png')
        );
        this.load.image(
            'player',
            require('../assets/images/trooper.png')
        );
        this.load.spritesheet(
            'alien-move',
            require('../assets/images/alien-move.png'),
            { frameWidth: 72, frameHeight: 72 }
        );
        this.load.spritesheet(
            'pacman-bullet',
            require('../assets/images/pacman-spritesheet.png'),
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet(
            'zombie-move',
            require('../assets/images/zombie-move.png'),
            { frameWidth: 72, frameHeight: 72 }
        );
        this.load.spritesheet(
            'zombie-die',
            require('../assets/images/zombie-die.png'),
            { frameWidth: 72, frameHeight: 72 }
        );
    }

    create() {
        this.player;

        this.add.tileSprite( 0, 0, 2000, 2000, 'bg' ).setOrigin( 0 );

        this.cameras.main.setBounds( 0, 0, 2000, 2000 );
        this.physics.world.setBounds( 0, 0, 2000, 2000 );

        this.zombies = this.physics.add.group({ classType: Zombie });
        this.aliens = this.physics.add.group({ classType: Alien });

        this.input.gamepad.once( 'down', ( gamepad, btn, idx ) => {
            this.player = new Player( 
                gamepad, 
                this, 
                config.width / 2, 
                config.height / 2 
            );

            this.cameras.main.startFollow( this.player, true, 0.05, 0.05 );

            this.physics.add.overlap(
                [this.aliens, this.zombies],
                this.player.bullets,
                ( bullet, baddie ) => {
                    if ( !baddie.active ) return;
                    baddie.group.killAndHide( baddie );
                }
            );

            this.time.addEvent({
                delay: 15000,
                repeat: 1,
                callback: () => {
                    WAVE1.createBaddies( this );
                }
            });
        });

        WAVE1.createBaddies( this );

        this.physics.add.collider( [this.aliens, this.zombies], [this.aliens, this.zombies] );
    }

}