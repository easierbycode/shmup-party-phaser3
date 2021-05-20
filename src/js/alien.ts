
import BaseEntity from "./base-entity";


export default class Alien extends BaseEntity {

    health  = 10;
    speed   = 90;
    
    constructor( scene: Phaser.Scene, x, y, key = 'alien-move' ) {
        super( scene, x, y, key );

        this.anims.create({
            key: 'default',
            frames: scene.anims.generateFrameNumbers( 'alien-move' ),
            frameRate: 60,
            repeat: -1
        });

        this
            .setOffset( 22, 20 )
            .setSize( 24, 32 )
            .play('default');
    }

    preUpdate( time, delta ) {
        if ( !this.visible )  return;

        super.preUpdate( time, delta );

        let activePlayers = this.scene.players.getMatching('active', true);
        
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