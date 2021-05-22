
import BaseEntity from "./base-entity";


export default class Zombie extends BaseEntity {

    health  = 8;
    speed   = 60;

    constructor( scene: Phaser.Scene, x, y, key = 'zombie-move' ) {
        super( scene, x, y, key );

        this.anims.create({
            key: 'default',
            frames: scene.anims.generateFrameNames( 'zombie-move' ),
            frameRate: 60,
            repeat: -1
        });
        // this.anims.create({
        //     key: 'death',
        //     frames: scene.anims.generateFrameNames( 'zombie-die' ),
        //     frameRate: 60,
        //     repeat: -1
        // });

        this
            .setOffset( 29, 23 )
            .setSize( 19, 26 )
            .play( 'default' );
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