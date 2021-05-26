
import { config } from './config';


export default {

    ALIENS      : 44,
    LIZARDDENS  : 1,
    PHAROAHS    : 1,
    ZOMBIES     : 88,

    createBaddies : function( scene ) {
        for ( let i = 0; i < this.ALIENS; i++ ) {
            let alien = scene.aliens.get(
                Phaser.Math.Between( -72, config.width + 72 ),
                Phaser.Math.Between( -72, -288 )
            );

            alien
                .reset()
                .group = scene.aliens;
        }


        let {x, y, width, height} = scene.cam.worldView;

        if ( width == 0 ) {
            ({width, height} = scene.game.config);
            width /= scene.cam.zoom;
            height /= scene.cam.zoom;
        }
        
        for ( let i = 0; i < this.LIZARDDENS; i++ ) {
            let lizardDen = scene.lizardDens.get(
                Phaser.Math.Between( x, x + width ),
                Phaser.Math.Between( y, y + height )
            );

            lizardDen
                .reset()
                .group = scene.lizardDens;
        }


        for ( let i = 0; i < this.PHAROAHS; i++ ) {
            let pharoah = scene.pharoahs.get(
                Phaser.Math.Between( x, x + width ),
                Phaser.Math.Between( y, y + height )
            );

            pharoah
                .reset()
                .group = scene.pharoahs;
        }


        for ( let i = 0; i < this.ZOMBIES; i++ ) {
            let zombie = scene.zombies.get(
                Phaser.Math.Between( -72, -288 ),
                Phaser.Math.Between( -72, config.height + 72 )
            );

            zombie
                .reset()
                .group = scene.zombies;
        }
    }
}