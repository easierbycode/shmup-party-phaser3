
import Player from './player.ts';
import Phaser from 'phaser';
import Zombie from './zombie';
import Alien from './alien';
import WAVE1 from './wave1';
import { config } from './config.ts';
import PhaserGUIAction from 'phaser3_gui_inspector';
import BloodSplatter from './blood-splatter';
import LizardDen from './lizard-den';
import Lizard from './lizard';

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

    assignedGamepadIds: string[] = [];
    powerups!: Phaser.GameObjects.Group;

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

        this.load.atlas(
            'alien',
            require('../assets/images/alien.png'),
            require('../assets/images/alien.json')
        );
        // this.load.atlas(
        //     'alien-den',
        //     require('../assets/images/alien-den.png'),
        //     require('../assets/images/alien-den.json')
        // );
        // this.load.atlas(
        //     'beetle',
        //     require('../assets/images/beetle.png'),
        //     require('../assets/images/beetle.json')
        // );
        // this.load.atlas(
        //     'centipede',
        //     require('../assets/images/centipede.png'),
        //     require('../assets/images/centipede.json')
        // );
        // this.load.atlas(
        //     'crabfly',
        //     require('../assets/images/crabfly.png'),
        //     require('../assets/images/crabfly.json')
        // );
        this.load.atlas(
            'lizard',
            require('../assets/images/lizard.png'),
            require('../assets/images/lizard.json')
        );
        this.load.atlas(
            'lizard-den',
            require('../assets/images/lizard-den.png'),
            require('../assets/images/lizard-den.json')
        );
        // this.load.atlas(
        //     'player',
        //     require('../assets/images/trooper.png'),
        //     require('../assets/images/trooper.json')
        // );
        // this.load.atlas(
        //     'maggot',
        //     require('../assets/images/maggot.png'),
        //     require('../assets/images/maggot.json')
        // );
        // this.load.atlas(
        //     'spider-boss',
        //     require('../assets/images/spider-boss.png'),
        //     require('../assets/images/spider-boss.json')
        // );
        // this.load.atlas(
        //     'spider-nest',
        //     require('../assets/images/spider-nest.png'),
        //     require('../assets/images/spider-nest.json')
        // );
        // this.load.atlas(
        //     'spider1',
        //     require('../assets/images/spider1.png'),
        //     require('../assets/images/spider1.json')
        // );
        // this.load.atlas(
        //     'spider2',
        //     require('../assets/images/spider2.png'),
        //     require('../assets/images/spider2.json')
        // );
        this.load.atlas(
            'zombie',
            require('../assets/images/zombie.png'),
            require('../assets/images/zombie.json')
        );
        this.load.image(
            'bg',
            require('../assets/images/scorched-earth.png')
        );
        this.load.image(
            'cola',
            require('../assets/images/cola.png')
        );
        this.load.image(
            'explosion-0',
            require('../assets/images/explosion-0.png')
        );
        this.load.image(
            'explosion-1',
            require('../assets/images/explosion-1.png')
        );
        this.load.image(
            'explosion-skull',
            require('../assets/images/explosion-skull.png')
        );
        this.load.image(
            'explosion-skull-2',
            require('../assets/images/explosion-skull-2.png')
        );
        this.load.image(
            'explosion-circle',
            require('../assets/images/explosion-circle.png')
        );
        this.load.image(
            'nuke',
            require('../assets/images/powerup-nuke.png')
        );
        this.load.image(
            'player',
            require('../assets/images/player.png')
        );
        this.load.spritesheet(
            'barrier',
            require('../assets/images/barrier.png'),
            { frameWidth: 80, frameHeight: 41 }
        );
        this.load.spritesheet(
            'blood-splat',
            require('../assets/images/blood-splat.png'),
            { frameWidth: 137, frameHeight: 136 }
        );
        this.load.spritesheet(
            'ciga-bullet',
            require('../assets/images/ciga-bullet.png'),
            { frameWidth: 9, frameHeight: 12 }
        );
        this.load.spritesheet(
            'ciga-bullet.death',
            require('../assets/images/ciga-bullet-death.png'),
            { frameWidth: 9, frameHeight: 11 }
        );
        this.load.spritesheet(
            'laser',
            require('../assets/images/laser.png'),
            { frameWidth: 168, frameHeight: 72 }
        );
        this.load.spritesheet(
            'pacman-bullet',
            require('../assets/images/pacman-spritesheet.png'),
            { frameWidth: 32, frameHeight: 32 }
        );
    }

    create() {
        if ( config.physics[config.physics.default].debug ) {
            PhaserGUIAction( this );
            window.PhaserGUI = {
                destroyGUI: () => {}
            }
        }

        this.players = this.add.group();
        this.powerups = this.physics.add.group();
        this.nukeBlasts = this.physics.add.group({ immovable: true });
        this.bloodSplatters = this.add.group({ classType: BloodSplatter });

        this.add.tileSprite( 0, 0, 2000, 2000, 'bg' ).setOrigin( 0 );

        this.cam = this.cameras.main.setBounds( 0, 0, 2000, 2000 );
        this.cam.setZoom( 2 );
        this.physics.world.setBounds( 0, 0, 2000, 2000 );
        
        this.aliens     = this.physics.add.group({ classType: Alien });
        this.lizardDens = this.physics.add.group({ classType: LizardDen });
        this.lizards    = this.physics.add.group({ classType: Lizard });
        this.zombies    = this.physics.add.group({ classType: Zombie });

        let addPlayer = ( gamepad: Phaser.Input.Gamepad.Gamepad ) => {
            this.assignedGamepadIds.push( gamepad.id );
            
            let player = new Player( 
                gamepad, 
                this, 
                config.width / 2, 
                config.height / 2 
            );

            this.cameras.main.startFollow( player, true, 0.05, 0.05 );

            this.time.addEvent({
                delay: 15000,
                repeat: 1,
                callback: () => {
                    WAVE1.createBaddies( this );
                }
            });

            this.players.add( player );
        };

        if ( this.input.gamepad.total )  this.input.gamepad.gamepads.forEach( addPlayer );

        this.input.gamepad.on('down', ( pad: Phaser.Input.Gamepad.Gamepad ) => {
            this.assignedGamepadIds.includes( pad.id ) ? void( 0 ) : addPlayer( pad );
        });

        WAVE1.createBaddies( this );

        // collider between zombies/aliens causes big FPS slowdown when several waves pile around player
        this.physics.add.collider( [this.aliens, this.zombies], [this.aliens, this.zombies] );
        this.physics.add.collider( this.nukeBlasts, [this.aliens, this.zombies] );
        this.physics.add.collider( this.players, this.powerups, (player, powerup) => {
            player.playerVsPowerup( player, powerup )
        });

        // DRJ:DEBUG - add nuke on click
        this.input.on('pointerdown', (pointer, currentlyOver) => {
            let {worldX: x, worldY: y} = pointer;
            this.powerups.create(x, y, 'nuke');
        });
    }

    update() {

        if ( this.players.getLength() ) {
        this.physics.overlap(
            [this.aliens, this.lizardDens, this.lizards, this.zombies],
            this.players.children.entries[0].bullets,
            collideCallback
        )

        this.physics.overlap(
            [this.aliens, this.lizardDens, this.lizards, this.zombies],
            this.players.children.entries[0].barrierDash.bullets,
            collideCallback
        )
        
        this.players.children.entries[0].bullets.children.each(b=>b.update());
        }
    }

}


let collideCallback = ( bullet, baddie ) => {
    if ( !baddie.visible || !bullet.visible ) return;
    bullet.damage( bullet, baddie );
    baddie.damage( baddie, bullet );                    
}