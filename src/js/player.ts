
import Phaser from 'phaser';
import Barrier from "./barrier";
import BaseEntity from "./base-entity";
import CigaBullet from './ciga-bullet';
import IonBullet from "./ion-bullet";
import PacmanBullet from "./pacman-bullet";
import { Bullet, Weapon } from './weapon-plugin';
import { BULLET_KILL } from "./weapon-plugin/events";


export default class Player extends BaseEntity {
    
    _previousWeapon     = 0;
    _speed              = 3.0;
    currentWeapon       = 0;
    gamepad: Phaser.Input.Gamepad.Gamepad;
    gamepadVibration: GamepadHapticActuator | null;
    inputEnabled: boolean = true;
    scene!: Phaser.Scene;
    weapons: Weapon[]   = [];
    private muzzlePoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private lastAimAngle: number | null = null;
    private orientationOffset: number;
    
    constructor( 
        gamepad, 
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        key: string = 'player' 
    ) {
        super( scene, x, y, key );

        scene.add.existing( this );

        this.body.setCollideWorldBounds( true );

        this.gamepad            = gamepad;
        this.gamepadVibration   = gamepad.vibration;
        this.group              = scene.players;
        this.orientationOffset = this.texture.key === 'player' ? -Math.PI / 2 : 0;

        this.gamepad.on('down', (idx: number) => {
            // L1 button
            if (idx == 4)  this.barrierDash();

            // R1 button
            if (idx == 5)  this.currentWeapon = Phaser.Math.Wrap(this.currentWeapon-1, 0, this.weapons.length-1);
            
            // SELECT button
            if (idx == 8)  this.scene.scene.restart();

            // START button
            if (idx == 9)  this.scene.physics.world.isPaused ? this.scene.physics.resume() : this.scene.physics.pause();
        });

        this.weapons.push( new IonBullet( this, scene ) );
        this.weapons.push( new CigaBullet( this, scene ) );
        this.weapons.push( new PacmanBullet( this, scene ) );
        this.weapons.push( new Barrier( this, scene ) );
    }

    get bullets() {
        return this.weapons[ this.currentWeapon ].bullets;
    }

    get previousWeapon() {
        return this._previousWeapon;
    }

    set previousWeapon( weaponIdx: number ) {
        if ( weaponIdx != this.weapons.length - 1 )  this._previousWeapon = weaponIdx;
    }

    barrierDash() {
        this.previousWeapon = this.currentWeapon;
        this.currentWeapon = this.weapons.length - 1;
        const weapon = this.weapons[ this.currentWeapon ];

        weapon
            .once(BULLET_KILL, ( bullet: Bullet, weapon: Weapon ) => {
                this.currentWeapon = this.previousWeapon;
            })

        const angle = this.lastAimAngle ?? this.rotation;
        this.fireWeapon( weapon, angle );
    }

    preUpdate( time, delta ) {
        super.preUpdate( time, delta );

        this.body.stop();

        if ( !this.inputEnabled )  return;

        if ( this.gamepad.left || this.gamepad.leftStick.x < -0.1 ) {
            this.body.velocity.x    = -this.speed;
        } else if ( this.gamepad.right || this.gamepad.leftStick.x > 0.1 ) {
            this.body.velocity.x    = this.speed;
        }
    
        if ( this.gamepad.up || this.gamepad.leftStick.y < -0.1 ) {
            this.body.velocity.y    = -this.speed;
        }
        else if ( this.gamepad.down || this.gamepad.leftStick.y > 0.1 ) {
            this.body.velocity.y    = this.speed;
        }

        var thumbstickAngle = this.coordinatesToRadians( this.gamepad.rightStick.x, this.gamepad.rightStick.y );
                
        if ( thumbstickAngle !== null ) {
            this.rotation = thumbstickAngle + this.orientationOffset;
            this.lastAimAngle = thumbstickAngle;

            this.fireWeapon( this.weapons[ this.currentWeapon ], thumbstickAngle );
        }
    }

    private fireWeapon( weapon: Weapon, aimAngle: number ) {
        const muzzle = this.getFirePoint( aimAngle );
        const fireAngle = Phaser.Math.Angle.Wrap( aimAngle - Math.PI / 2 );

        const targetX = muzzle.x + Math.cos( fireAngle ) * 1000;
        const targetY = muzzle.y + Math.sin( fireAngle ) * 1000;

        weapon.fire( muzzle, targetX, targetY );
    }

    private getFirePoint( angle: number ): Phaser.Math.Vector2 {
        const offset = Math.max(this.displayWidth, this.displayHeight) * 0.4;

        this.muzzlePoint.set(
            this.x + Math.cos(angle) * offset,
            this.y + Math.sin(angle) * offset
        );

        return this.muzzlePoint;
    }

    coordinatesToRadians( x, y ) {
        if ( x === 0 && y === 0 ) {
            return null;
        }

        let radians = Math.atan2( y, x ) + Math.PI / 2;
        radians = Phaser.Math.Angle.Wrap( radians );

        if ( radians < 0 ) {
            radians += Phaser.Math.PI2;
        }

        return radians;
    }

    playerVsPowerup( player: Player, powerup ) {
        if (player.gamepadVibration)
          player.gamepad.vibration.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 100,
            weakMagnitude: 1.0,
            strongMagnitude: 0.3
          });
        
        // NUKE
        if ( powerup.texture.key == 'nuke' ) {
            let {x, y} = powerup;
            let {scene} = player;
            let explosionSkull = scene.add.image( x, y, 'explosion-skull' ).setAlpha( 0 );
            let explosion = scene.add.image( x, y, 'explosion-0' );
            let explosion1 = scene.add.image( x, y, 'explosion-1' );
            let onComplete = ( tween, targets ) => targets[0].destroy();
            let explosionTweenConfig = {
                alpha: 0.2,
                duration: 825,
                onComplete
            }
            let nukeBlast = scene.physics.add.image( x, y, 'explosion-circle' ).setScale( 0 );
            nukeBlast.body.setCircle( nukeBlast.width / 2 );
            scene.nukeBlasts.add( nukeBlast );

            scene.cameras.main.shake( 750, 0.008, true );

            // fade In explosion skull
            scene.tweens.add({
                targets: explosionSkull,
                alpha: 0.8,
                duration: 825,
                scale: 3,
                onComplete
            });
            
            scene.tweens.add({
                targets: explosion1,
                scale: 5,
                angle: -180,
                ...explosionTweenConfig
            });

            scene.tweens.add({
                targets: explosion,
                scale: 4,
                angle: 180,
                ...explosionTweenConfig
            });
            
            scene.tweens.add({
                targets: nukeBlast,
                scale: 5.5,
                alpha: {from: 0.8, to: 0.05},
                duration: 750,
                onComplete
            });
        }


        powerup.destroy();
    }

}
