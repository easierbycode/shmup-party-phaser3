
import BaseEntity from "./base-entity";
import PharoahFireball from './pharoah-fireball';


export default class Pharoah extends BaseEntity {

    health  = 2000;
    
    constructor( scene: Phaser.Scene, x, y, key = 'pharoah' ) {
        super( scene, x, y, key );

        this.anims.create({
            key: 'default',
            frames: scene.anims.generateFrameNames( 'pharoah' ),
            frameRate: 20,
            yoyo: true,
            hideOnComplete: true
        });

        this.on('animationcomplete-default', (anim, frame, go, key) => {
            this.hideAndReappear();
        });

        this.on('animationupdate', (anim, frame, go, key) => {
            if ( frame.index == 4 ) {
                anim.pause();
                
                this.shootFireball();
                
                this.scene.time.addEvent({
                    delay: 2000,
                    callback: () => anim.resume()
                })
            }
        });

        this
            // .setOffset( 22, 20 )
            // .setSize( 24, 32 )
            .play('default');
        
        this.fireball = new PharoahFireball(
            this,
            this.scene
        );
    }

    hideAndReappear() {
        this.scene.time.addEvent({
            delay: 4000,
            callback: () => {
                let {x, y, width, height} = this.scene.cam.worldView;
                this
                    .setPosition(
                        Phaser.Math.Between( x, x + width ),
                        Phaser.Math.Between( y, y + height )
                    )
                    .setVisible( true )
                    .play( 'default' );
            }
        })
        
    }

    shootFireball() {
        let activePlayers = this.scene.players.getMatching( 'active', true );
        
        if ( activePlayers.length ) {
            let closestPlayer = this.scene.physics.closest( this, activePlayers );
            this.fireball.fireAtSprite( closestPlayer );
        }
    }

}