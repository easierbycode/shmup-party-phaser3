
import BaseEntity from "./base-entity";


export default class LizardDen extends BaseEntity {

    health              = 800;
    maxCreaturesToSpawn = 100;
    spawnInterval       = 6;
    
    constructor( scene: Phaser.Scene, x, y, key = 'lizard-den' ) {
        super( scene, x, y, key );

        this.anims.create({
            key: 'default',
            frames: scene.anims.generateFrameNames(
                'lizard-den',
                {
                    prefix: 'move-',
                    zeroPad: 4,
                    start: 1,
                    end: 32
                }
            ),
            frameRate: 60,
            repeat: -1
        });

        this
            .setSize( 55, 55 )
            .setOffset( 9, 9 )
            .play('default');
        
        this.spawnTimer = scene.time.addEvent({
            delay: this.spawnInterval * 1000,
            callback: () => {
                if ( !this.visible || !scene.players.getLength() )  return;
                let lizard = scene.lizards.get( this.x, this.y );
                lizard
                    .setActive( true )
                    .setVisible( true )
                    .group = scene.lizards;
            },
            repeat: -1
        });
    }

    preUpdate( time, delta ) {
        if ( !this.visible )  return;

        super.preUpdate( time, delta );
    }

}