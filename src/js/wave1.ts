
export default {

    ALIENS    : 44,
    ZOMBIES   : 88,

    createBaddies : function( scene ) {
        console.log( 'createBaddies')
        for ( let i = 0; i < this.ALIENS; i++ ) {
            let alien = scene.aliens.get(
                Phaser.Math.Between( -72, 1352 ),
                Phaser.Math.Between( -72, -288 )
            );

            alien
                .setActive( true )
                .setVisible( true )
                .group = scene.aliens;
        }

        for ( let i = 0; i < this.ZOMBIES; i++ ) {
            let zombie = scene.zombies.get(
                Phaser.Math.Between( -72, -288 ),
                Phaser.Math.Between( -72, 840 )
            );

            zombie
                .setActive( true )
                .setVisible( true )
                .group = scene.zombies;
        }
    }
}