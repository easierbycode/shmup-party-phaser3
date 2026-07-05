
import Phaser from 'phaser';
import Barrier from "./barrier";
import BaseEntity from "./base-entity";
import CigaBullet from './ciga-bullet';
import IonBullet from "./ion-bullet";
import PacmanBullet from "./pacman-bullet";
import { Bullet, Weapon } from './weapon-plugin';
import { BULLET_KILL } from "./weapon-plugin/events";
import { actionsForButton, aliasSnesButton, ControlsState, lowerTriggerThresholds } from "./controls";
import { faceAim, isSnesPadId, readDpad, rightStickIsTrustworthy, TwinStick } from "./twin-stick";


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
    // SNES pads remap some buttons (ZR → b15); alias them back to standard
    // indices before action dispatch so the default bindings apply. See controls.ts.
    private isSnesPad: boolean = false;

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
        // Make the L2/R2 triggers fire 'down' on a normal pull (see controls.ts).
        lowerTriggerThresholds( gamepad );
        this.group              = scene.players;
        this.orientationOffset = this.texture.key === 'player' ? -Math.PI / 2 : 0;
        // SNES pads expose non-standard layouts (see twin-stick.ts); detect by
        // id for the action-button aliasing. Movement/aim reads no longer need
        // a per-pad mode: readDpad()/faceAim() handle every layout, and the
        // right stick — real or launcher-synthesized — always takes precedence.
        this.isSnesPad = isSnesPadId( this.gamepad.id );

        // Button → action dispatch is driven by the remappable bindings in
        // controls.ts (edited via the in-game Controls UI). Defaults: Dash on
        // L1+R1, Prev/Next Weapon on L2/R2, Restart on SELECT, Pause on START.
        this.gamepad.on('down', (idx: number) => {
            // Ignore gameplay input while the Controls UI is up — it navigates
            // off these same buttons.
            if (ControlsState.open)  return;

            // SNES pads report some buttons at non-standard indices (ZR → b15);
            // map them back so the default bindings (R2 = 7, etc.) apply.
            const button = this.isSnesPad ? aliasSnesButton(idx, this.gamepad) : idx;

            for (const action of actionsForButton(button)) {
                switch (action) {
                    case 'dash':        this.barrierDash();   break;
                    case 'prevWeapon':  this.cycleWeapon(-1); break;
                    case 'nextWeapon':  this.cycleWeapon(1);  break;
                    case 'restart':     this.scene.scene.restart(); break;
                    case 'pause':
                        this.scene.physics.world.isPaused
                            ? this.scene.physics.resume()
                            : this.scene.physics.pause();
                        break;
                }
            }
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

    // Cycle the active weapon forward (+1) or back (-1). The last slot is the
    // barrier (the dash weapon), so wrap across the real weapons only.
    cycleWeapon( dir: number ) {
        this.currentWeapon = Phaser.Math.Wrap( this.currentWeapon + dir, 0, this.weapons.length - 1 );
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

        const move = this.getMoveDirection();

        if ( move.x < 0 )       this.body.velocity.x = -this.speed;
        else if ( move.x > 0 )  this.body.velocity.x = this.speed;

        if ( move.y < 0 )       this.body.velocity.y = -this.speed;
        else if ( move.y > 0 )  this.body.velocity.y = this.speed;

        // Aim + fire. A right stick — real, or synthesized by the cmg launcher's
        // Twin-Stick patch (D-pad → left stick, faces → right stick) — takes
        // precedence, but only where axes[2]/[3] are actually a stick: on raw
        // non-standard SNES layouts they can carry the digital D-pad pair (see
        // rightStickIsTrustworthy). Without stick signal, Twin-Stick mode aims
        // with the face buttons and auto-fires continuously in the last aimed
        // direction (defaults to up); SNES pads keep that behavior even with
        // the mode off, since they have no other way to aim.
        const thumbstickAngle = rightStickIsTrustworthy( this.gamepad )
            ? this.coordinatesToRadians( this.gamepad.rightStick.x, this.gamepad.rightStick.y )
            : null;

        if ( thumbstickAngle !== null ) {
            this.rotation = thumbstickAngle + this.orientationOffset;
            this.lastAimAngle = thumbstickAngle;

            this.fireWeapon( this.weapons[ this.currentWeapon ], thumbstickAngle );
        } else if ( TwinStick.enabled || this.isSnesPad ) {
            const aim = faceAim( this.gamepad );
            const faceButtonAngle = this.coordinatesToRadians( aim.x, aim.y );

            if ( faceButtonAngle !== null )  this.lastAimAngle = faceButtonAngle;

            const aimAngle = this.lastAimAngle ?? 0;
            this.rotation = aimAngle + this.orientationOffset;

            this.fireWeapon( this.weapons[ this.currentWeapon ], aimAngle );
        }
    }

    // Resolve the movement direction as { x, y } each in { -1, 0, 1 }: the
    // D-pad in any of its layouts (standard buttons 12-15, POV hat, digital
    // hat pairs — see twin-stick.ts) or the left stick.
    private getMoveDirection(): { x: number; y: number } {
        const dpad = readDpad( this.gamepad );

        const x = dpad.x !== 0 ? dpad.x
                : this.gamepad.leftStick.x < -0.1 ? -1
                : this.gamepad.leftStick.x >  0.1 ?  1 : 0;
        const y = dpad.y !== 0 ? dpad.y
                : this.gamepad.leftStick.y < -0.1 ? -1
                : this.gamepad.leftStick.y >  0.1 ?  1 : 0;

        return { x, y };
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
