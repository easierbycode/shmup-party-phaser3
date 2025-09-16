
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
import Pharoah from './pharoah';

const ZOOM_LERP = 1; 
const ZOOM_MAX  = 2;
const ZOOM_MIN  = 1.0;
const files     = [
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
    mid: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
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
        this.load.atlas(
            'duke',
            require('../assets/images/duke.png'),
            require('../assets/images/duke.json')
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
            'fireball',
            require('../assets/images/fireball.png'),
            { frameWidth: 41, frameHeight: 51 }
        );
        this.load.spritesheet(
            'ion-bullet',
            require('../assets/images/ion.png'),
            { frameWidth: 48, frameHeight: 30 }
        );
        this.load.spritesheet(
            'ion-bullet-impact',
            require('../assets/images/ion-impact.png'),
            { frameWidth: 18, frameHeight: 22 }
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
        this.load.spritesheet(
            'pac-ghost',
            require('../assets/images/pac-ghost.png'),
            { frameWidth: 13, frameHeight: 14 }
        );
        this.load.spritesheet(
            'pharoah',
            require('../assets/images/pharoah.png'),
            { frameWidth: 159, frameHeight: 73 }
        );
        this.load.spritesheet(
            'smoke',
            require('../assets/images/smoke.png'),
            { frameWidth: 26, frameHeight: 33 }
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
        this.cam.startFollow( this.mid );
        this.physics.world.setBounds( 0, 0, 2000, 2000 );

        this.baddies = [
            this.aliens     = this.physics.add.group({ classType: Alien }),
            this.lizardDens = this.physics.add.group({ classType: LizardDen }),
            this.lizards    = this.physics.add.group({ classType: Lizard }),
            this.pharoahs   = this.physics.add.group({ classType: Pharoah }),
            this.zombies    = this.physics.add.group({ classType: Zombie })
        ]

        this.anims.create({
            key: 'duke_animation',
            frames: [
                { key: 'duke', frame: 'duke_0' },
                { key: 'duke', frame: 'duke_1' },
                { key: 'duke', frame: 'duke_2' },
                { key: 'duke', frame: 'duke_3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        let addPlayer = ( gamepad: Phaser.Input.Gamepad.Gamepad ) => {
            this.assignedGamepadIds.push( gamepad.id );

            const playerIdx = this.players.getLength();
            const isSecondPlayer = playerIdx === 1;
            const textureKey = isSecondPlayer ? 'duke' : 'player';

            let player = new Player( 
                gamepad, 
                this, 
                config.width / 2, 
                config.height / 2,
                textureKey
            );

            if ( isSecondPlayer ) {
                player.play( 'duke_animation' );
            }

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
        let activePlayers = this.players.getMatching( 'active', true );
        
        if ( activePlayers.length ) {
            let bullets = activePlayers[0].bullets.getMatching( 'visible', true );
            
            this.mid.copy( activePlayers[0].body.center );

            if ( activePlayers.length == 2 ) {
                bullets.push( ...activePlayers[1].bullets.getMatching( 'visible', true ) );

                this.mid.lerp( activePlayers[1].body.center, 0.5 );

                var dist = Phaser.Math.Distance.BetweenPoints(
                    activePlayers[0].body.position,
                    activePlayers[1].body.position
                );

                var min = Math.min( this.scale.width, this.scale.height ) / 1.5;

                this.cam.setZoom(
                    Phaser.Math.Linear(
                        this.cam.zoom,
                        Phaser.Math.Clamp(min / dist, ZOOM_MIN, ZOOM_MAX),
                        ZOOM_LERP
                    )
                );
            } else {
                this.cam.setZoom( 2 );
            }

            this.physics.overlap(
                this.baddies,
                bullets,
                collideCallback
            );
        }
    }

}


let collideCallback = ( bullet, baddie ) => {
    if ( !baddie.visible || !bullet.visible ) return;
    bullet.damage( bullet, baddie );
    baddie.damage( baddie, bullet );                    
}
