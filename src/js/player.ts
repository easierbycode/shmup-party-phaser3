
import BaseEntity from "./base-entity";
import PacmanBullet from "./pacman-bullet";
import { Weapon } from './weapon-plugin';


export default class Player extends BaseEntity {
    
    currentWeapon       = 0;
    weapons: Weapon[]   = [];
    
    constructor( gamepad, scene: Phaser.Scene, x: number, y: number, key: string = 'player' ) {
        super( scene, x, y, key );

        this.body.setCollideWorldBounds( true );

        this.gamepad    = gamepad;

        this.weapons.push( new PacmanBullet( this, scene ) );
    }

    get bullets() {
        return this.weapons[ this.currentWeapon ].bullets;
    }

    preUpdate( time, delta ) {
        super.preUpdate( time, delta );

        this.body.stop();

        if ( this.gamepad.left || this.gamepad.leftStick.x < -0.1 ) {
            this.body.velocity.x    = -150;
        } else if ( this.gamepad.right || this.gamepad.leftStick.x > 0.1 ) {
            this.body.velocity.x    = 150;
        }
    
        if ( this.gamepad.up || this.gamepad.leftStick.y < -0.1 ) {
            this.body.velocity.y    = -150;
        }
        else if ( this.gamepad.down || this.gamepad.leftStick.y > 0.1 ) {
            this.body.velocity.y    = 150;
        }

        var thumbstickAngle = this.coordinatesToRadians( this.gamepad.rightStick.x, this.gamepad.rightStick.y );
                
        if ( thumbstickAngle !== null ) {
            this.rotation   = thumbstickAngle;
            this.weapons[ this.currentWeapon ].fire( this.getRightCenter() );
        }
    }

    coordinatesToRadians( x, y ) {
        if ( x === 0 && y === 0 ) {
            return null;
        }

        let radians = Math.atan2( y, x );
        if ( radians < 0 ) {
            radians += 2 * Math.PI;
        }
        return Math.abs( radians );
    }

}
