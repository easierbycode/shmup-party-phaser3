
import Phaser from 'phaser';
import Barrier from "./barrier";
import BaseEntity from "./base-entity";
import CigaBullet from './ciga-bullet';
import IonBullet from "./ion-bullet";
import PacmanBullet from "./pacman-bullet";
import { Bullet, Weapon } from './weapon-plugin';
import { BULLET_KILL } from "./weapon-plugin/events";
import { actionsForButton, ControlsState, lowerTriggerThresholds } from "./controls";


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
    // SNES-style pads have no analog right stick, so Phaser's `rightStick`
    // (axes [2]/[3]) stays at 0,0 and can't aim. For those we aim with the face
    // buttons and auto-fire instead.
    private useFaceButtonAiming: boolean = false;

    // Raw `buttons[]` indices for the four face buttons, used for aiming.
    // The Switch-Online SNES pad reports a NON-standard layout (mapping === '',
    // ~10 axes, 16 buttons), so these are raw HID indices, NOT the W3C standard
    // 0=bottom/1=right/2=left/3=top convention. Verify per-pad on hardware.
    private static readonly FACE_AIM = {
        up:    3,   // X (top face button)
        down:  0,   // B (bottom face button)
        left:  2,   // Y (left face button)
        right: 1,   // A (right face button)
    };

    // SNES pads report the d-pad as a POV hat on this axis, normalized to
    // [-1, 1] across 8 directions clockwise from up (N = -1, +2/7 per step);
    // the released/neutral value (~1.2857) sits outside that range.
    private static readonly DPAD_HAT_AXIS = 9;
    private static readonly HAT_DIRECTIONS = [
        { x:  0, y: -1 },   // 0  N  (up)
        { x:  1, y: -1 },   // 1  NE
        { x:  1, y:  0 },   // 2  E  (right)
        { x:  1, y:  1 },   // 3  SE
        { x:  0, y:  1 },   // 4  S  (down)
        { x: -1, y:  1 },   // 5  SW
        { x: -1, y:  0 },   // 6  W  (left)
        { x: -1, y: -1 },   // 7  NW
    ];
    
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
        // SNES pads expose a non-standard layout and varying axis counts (the
        // Switch-Online SNES pad reports id "SNES Controller ..." with ~10 axes),
        // so detect them by id, with a fallback for true low-axis-count pads.
        const padId = ( this.gamepad.id || '' ).toLowerCase();
        this.useFaceButtonAiming = /snes/.test( padId ) || this.gamepad.axes.length < 4;

        // Button → action dispatch is driven by the remappable bindings in
        // controls.ts (edited via the in-game Controls UI). Defaults: Dash on
        // L1+R1, Prev/Next Weapon on L2/R2, Restart on SELECT, Pause on START.
        this.gamepad.on('down', (idx: number) => {
            // Ignore gameplay input while the Controls UI is up — it navigates
            // off these same buttons.
            if (ControlsState.open)  return;

            for (const action of actionsForButton(idx)) {
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

        if ( this.useFaceButtonAiming ) {
            // SNES pad: face buttons steer the aim, and the weapon auto-fires
            // continuously in the last aimed direction (defaults to up).
            const faceButtonAngle = this.getFaceButtonAimAngle();

            if ( faceButtonAngle !== null )  this.lastAimAngle = faceButtonAngle;

            const aimAngle = this.lastAimAngle ?? 0;
            this.rotation = aimAngle + this.orientationOffset;

            this.fireWeapon( this.weapons[ this.currentWeapon ], aimAngle );
        } else {
            var thumbstickAngle = this.coordinatesToRadians( this.gamepad.rightStick.x, this.gamepad.rightStick.y );

            if ( thumbstickAngle !== null ) {
                this.rotation = thumbstickAngle + this.orientationOffset;
                this.lastAimAngle = thumbstickAngle;

                this.fireWeapon( this.weapons[ this.currentWeapon ], thumbstickAngle );
            }
        }
    }

    // Resolve the movement direction as { x, y } each in { -1, 0, 1 }. SNES pads
    // report the d-pad as a POV hat (Phaser's named d-pad getters read the wrong
    // raw buttons on this non-standard layout), so decode the hat for them; other
    // pads use the d-pad buttons / left stick as before.
    private getMoveDirection(): { x: number; y: number } {
        if ( this.useFaceButtonAiming )  return this.getHatDirection();

        const x = ( this.gamepad.left  || this.gamepad.leftStick.x < -0.1 ) ? -1
                : ( this.gamepad.right || this.gamepad.leftStick.x >  0.1 ) ?  1 : 0;
        const y = ( this.gamepad.up    || this.gamepad.leftStick.y < -0.1 ) ? -1
                : ( this.gamepad.down  || this.gamepad.leftStick.y >  0.1 ) ?  1 : 0;

        return { x, y };
    }

    // Decode the d-pad POV hat (axis Player.DPAD_HAT_AXIS) into an x/y direction.
    // Reads the raw axis value (not getValue(), whose 0.1 threshold would zero the
    // smallest direction values) and rounds it to one of the 8 hat octants.
    private getHatDirection(): { x: number; y: number } {
        const hat = this.gamepad.axes[ Player.DPAD_HAT_AXIS ];
        if ( !hat )  return { x: 0, y: 0 };

        const v = hat.value;

        // Released/neutral (~1.2857) sits outside the [-1, 1] direction range;
        // a near-zero value means the axis hasn't reported yet (the smallest real
        // hat direction is ~0.143). Treat both as "no input".
        if ( v < -1.05 || v > 1.05 || Math.abs( v ) < 0.05 )  return { x: 0, y: 0 };

        const octant = Math.round( ( v + 1 ) * 3.5 ) & 7;   // 0 = up, clockwise

        return Player.HAT_DIRECTIONS[ octant ];
    }

    // Map the four face buttons to an 8-way aim vector (combining buttons gives
    // diagonals), then reuse the thumbstick angle math. Returns null when no
    // face button is held. Indices come from Player.FACE_AIM.
    private getFaceButtonAimAngle(): number | null {
        const buttons = this.gamepad.buttons;
        const aim     = Player.FACE_AIM;

        const up    = buttons[ aim.up    ]?.pressed ? 1 : 0;
        const down  = buttons[ aim.down  ]?.pressed ? 1 : 0;
        const left  = buttons[ aim.left  ]?.pressed ? 1 : 0;
        const right = buttons[ aim.right ]?.pressed ? 1 : 0;

        return this.coordinatesToRadians( right - left, down - up );
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
