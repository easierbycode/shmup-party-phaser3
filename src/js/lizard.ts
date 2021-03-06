
import BaseEntity from "./base-entity";


export default class Lizard extends BaseEntity {

    _speed      = 1.5;
    health;
    maxHealth   = 200;
    
    constructor( scene: Phaser.Scene, x, y, key = 'lizard' ) {
        super( scene, x, y, key );

        this.anims.create({
            key: 'default',
            frames: scene.anims.generateFrameNames(
                'lizard',
                {
                    prefix: 'move-',
                    zeroPad: 4,
                    start: 1,
                    end: 64
                }
            ),
            frameRate: 60,
            repeat: -1
        });

        this
            .setSize( 24, 26 )
            .setOffset( 25, 23 )
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