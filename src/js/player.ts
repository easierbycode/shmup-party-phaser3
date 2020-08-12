
export default class Player extends Phaser.GameObjects.Sprite {
    
    constructor( gamepad, scene: Phaser.Scene, x: number, y: number, key: string = 'player' ) {
        super( scene, x, y, key );

        scene.physics.world.enableBody( this );

        this.body.setCollideWorldBounds( true );

        scene.add.existing( this );
        
        this.gamepad    = gamepad;
    }

    update() {
        this.body.velocity.x        = 0;
        this.body.velocity.y        = 0;

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
        }
    }

    coordinatesToRadians( x, y ) {
        if (x === 0 && y === 0) {
            return null;
        }

        let radians = Math.atan2(y, x);
        if (radians < 0) {
            radians += 2 * Math.PI;
        }
        return Math.abs(radians);
    }
}
