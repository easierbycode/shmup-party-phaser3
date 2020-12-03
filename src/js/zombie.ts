
import BaseEntity from "./base-entity";


export default class Zombie extends BaseEntity {

    health  = 8;
    speed   = 60;

    constructor( scene: Phaser.Scene, x, y, key = 'zombie-move' ) {
        super( scene, x, y, key );

        scene.anims.create({
            key: 'zombie.move',
            frames: scene.anims.generateFrameNumbers( 'zombie-move' ),
            frameRate: 30,
            repeat: -1
        });
        scene.anims.create({
            key: 'zombie.die',
            frames: scene.anims.generateFrameNumbers( 'zombie-die' ),
            frameRate: 30,
            repeat: -1
        });

        this
            .setOffset( 29, 23 )
            .setSize( 19, 26 )
            .play( 'zombie.move' );
    }

    preUpdate( time, delta ) {
        super.preUpdate( time, delta );
        
        if ( this.scene.player ) {
            this.rotation = Phaser.Math.Angle.BetweenPoints(
                this, 
                this.scene.player 
            );

            if ( this.scene.physics.overlap( this, this.scene.player ) ) {
                this.body.stop();
            } else {
                this.scene.physics.moveToObject( this, this.scene.player, this.speed );
            }
        }
    }

}