
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
        
        let activePlayers = this.scene.players.getAll('active', true);
        
        if ( activePlayers.length ) {
            let closestPlayer = this.scene.physics.closest(this, activePlayers);

            this.rotation = Phaser.Math.Angle.BetweenPoints(
                this, 
                closestPlayer 
            );

            if ( this.scene.physics.overlap( this, activePlayers ) ) {
                this.body.stop();
            } else {
                this.scene.physics.moveToObject( this, closestPlayer, this.speed );
            }
        }
    }

}