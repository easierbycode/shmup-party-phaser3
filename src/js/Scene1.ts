
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

import alienAtlasImage from '../assets/images/alien.png';
import alienAtlasData from '../assets/images/alien.json?url';
import lizardAtlasImage from '../assets/images/lizard.png';
import lizardAtlasData from '../assets/images/lizard.json?url';
import lizardDenAtlasImage from '../assets/images/lizard-den.png';
import lizardDenAtlasData from '../assets/images/lizard-den.json?url';
import zombieAtlasImage from '../assets/images/zombie.png';
import zombieAtlasData from '../assets/images/zombie.json?url';
import backgroundImage from '../assets/images/scorched-earth.png';
import colaImage from '../assets/images/cola.png';
import explosion0Image from '../assets/images/explosion-0.png';
import explosion1Image from '../assets/images/explosion-1.png';
import explosionSkullImage from '../assets/images/explosion-skull.png';
import explosionSkull2Image from '../assets/images/explosion-skull-2.png';
import explosionCircleImage from '../assets/images/explosion-circle.png';
import powerupNukeImage from '../assets/images/powerup-nuke.png';
import dukeAtlasImage from '../assets/images/duke_atlas.png';
import dukeAtlasData from '../assets/images/duke_atlas.json?url';
import playerImage from '../assets/images/player.png';
import barrierImage from '../assets/images/barrier.png';
import bloodSplatImage from '../assets/images/blood-splat.png';
import cigaBulletImage from '../assets/images/ciga-bullet.png';
import cigaBulletDeathImage from '../assets/images/ciga-bullet-death.png';
import fireballImage from '../assets/images/fireball.png';
import ionBulletImage from '../assets/images/ion.png';
import ionBulletImpactImage from '../assets/images/ion-impact.png';
import laserImage from '../assets/images/laser.png';
import pacmanSpritesheetImage from '../assets/images/pacman-spritesheet.png';
import pacGhostImage from '../assets/images/pac-ghost.png';
import pharoahSpritesheetImage from '../assets/images/pharoah.png';
import smokeImage from '../assets/images/smoke.png';
import loaderImage from '../assets/images/loader.png';
import logoImage from '../assets/images/shmup-party-logo.png';

const ZOOM_LERP = 1; 
const ZOOM_MAX  = 2;
const ZOOM_MIN  = 1.0;


export default class Scene1 extends Phaser.Scene {

    assignedGamepadIds: string[] = [];
    mid: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    powerups!: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: 'Scene1',
            pack: {
                files: [
                    { type: 'image', key: 'logo', url: logoImage },
                    { type: 'image', key: 'loader', url: loaderImage }
                ]
            }
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
            alienAtlasImage,
            alienAtlasData
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
            lizardAtlasImage,
            lizardAtlasData
        );
        this.load.atlas(
            'lizard-den',
            lizardDenAtlasImage,
            lizardDenAtlasData
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
            zombieAtlasImage,
            zombieAtlasData
        );
        this.load.image(
            'bg',
            backgroundImage
        );
        this.load.image(
            'cola',
            colaImage
        );
        this.load.image(
            'explosion-0',
            explosion0Image
        );
        this.load.image(
            'explosion-1',
            explosion1Image
        );
        this.load.image(
            'explosion-skull',
            explosionSkullImage
        );
        this.load.image(
            'explosion-skull-2',
            explosionSkull2Image
        );
        this.load.image(
            'explosion-circle',
            explosionCircleImage
        );
        this.load.image(
            'nuke',
            powerupNukeImage
        );
        this.load.atlas(
            'duke',
            dukeAtlasImage,
            dukeAtlasData
        );
        this.load.image(
            'player',
            playerImage
        );
        this.load.spritesheet(
            'barrier',
            barrierImage,
            { frameWidth: 80, frameHeight: 41 }
        );
        this.load.spritesheet(
            'blood-splat',
            bloodSplatImage,
            { frameWidth: 137, frameHeight: 136 }
        );
        this.load.spritesheet(
            'ciga-bullet',
            cigaBulletImage,
            { frameWidth: 9, frameHeight: 12 }
        );
        this.load.spritesheet(
            'ciga-bullet.death',
            cigaBulletDeathImage,
            { frameWidth: 9, frameHeight: 11 }
        );
        this.load.spritesheet(
            'fireball',
            fireballImage,
            { frameWidth: 41, frameHeight: 51 }
        );
        this.load.spritesheet(
            'ion-bullet',
            ionBulletImage,
            { frameWidth: 48, frameHeight: 30 }
        );
        this.load.spritesheet(
            'ion-bullet-impact',
            ionBulletImpactImage,
            { frameWidth: 18, frameHeight: 22 }
        );
        this.load.spritesheet(
            'laser',
            laserImage,
            { frameWidth: 168, frameHeight: 72 }
        );
        this.load.spritesheet(
            'pacman-bullet',
            pacmanSpritesheetImage,
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet(
            'pac-ghost',
            pacGhostImage,
            { frameWidth: 13, frameHeight: 14 }
        );
        this.load.spritesheet(
            'pharoah',
            pharoahSpritesheetImage,
            { frameWidth: 159, frameHeight: 73 }
        );
        this.load.spritesheet(
            'smoke',
            smokeImage,
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

        let addPlayer = ( gamepad: Phaser.Input.Gamepad.Gamepad ) => {
            this.assignedGamepadIds.push( gamepad.id );

            const playerIdx = this.players.getLength();
            const isFirstPlayer = playerIdx === 0;
            const textureKey = isFirstPlayer ? 'duke' : 'player';

            let player = new Player( 
                gamepad, 
                this, 
                config.width / 2, 
                config.height / 2,
                textureKey
            );

            if ( isFirstPlayer ) {
                player.setFrame( 'duke_0' );
                player.setScale( 1.4 );
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
