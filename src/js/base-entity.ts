
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

    damage( entity, bullet ) {
        let damagePoints = bullet.damagePoints || 1;
        
        this.health -= damagePoints;

        if ( this.health <= 0 ) {
            this.destroy();
        }
    }

}