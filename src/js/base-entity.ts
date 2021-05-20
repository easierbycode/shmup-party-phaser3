import BloodSplatter from "./blood-splatter";

export default class BaseEntity extends Phaser.Physics.Arcade.Sprite {
    
    health = 1;
    
    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        key: string
    ) {
        super( scene, x, y, key );

        scene.add.existing( this );
        scene.physics.world.enableBody( this );
    }

    damage( entity: BaseEntity, bullet ) {
        let damagePoints = bullet.damagePoints || 1;

        this.health -= damagePoints;

        if ( this.health <= 0 ) {
            let {x, y} = this;
            let bloodSplatters: Phaser.GameObjects.Group = this.scene.bloodSplatters;
            let bloodSplatter = bloodSplatters.get( x, y ).setVisible( true ).setActive( true );
            bloodSplatter.on(
                'animationcomplete-default',
                () => bloodSplatters.killAndHide( bloodSplatter )
            );
            bloodSplatter.play( 'default' );
            this.group.killAndHide( this );
        }
    }

}