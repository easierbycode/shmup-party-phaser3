
import BaseEntity from "./base-entity";


export default class Alien extends BaseEntity {

    health  = 10;
    speed   = 90;
    
    constructor( scene: Phaser.Scene, x, y, key = 'alien-move' ) {
        super( scene, x, y, key );

        scene.anims.create({
            key: 'alien.move',
            frames: scene.anims.generateFrameNumbers( 'alien-move' ),
            frameRate: 30,
            repeat: -1
        });

        this
            .setOffset( 22, 20 )
            .setSize( 24, 32 );

        this.play('alien.move');
    }

    preUpdate( time, delta ) {
        super.preUpdate( time, delta );
        
        if ( this.scene.player ) {
            this.rotation = Phaser.Math.Angle.BetweenPoints(
                this, 
                this.scene.player 
            );

            if (this.scene.physics.overlap(this, this.scene.player)) {
                this.body.stop();
            } else {
                this.scene.physics.moveToObject( this, this.scene.player, this.speed );
            }
        }
    }

}