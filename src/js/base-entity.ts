
import BloodSplatter from "./blood-splatter";


export default class BaseEntity extends Phaser.Physics.Arcade.Sprite {
    
    _speed      = 1;
    baseSpeed   = 50;
    health;
    maxHealth   = 1;
    
    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        key: string
    ) {
        super( scene, x, y, key );

        scene.physics.world.enableBody( this );
    }

    get speed() {
        return this.baseSpeed * this._speed;
    }

    damage( entity: BaseEntity, bullet ) {
        let damagePoints = bullet.damagePoints || 1;

        this.health -= damagePoints;

        if ( this.health <= 0 )  this.kill();
    }

    kill() {
        let {rotation, x, y} = this;
        let bloodSplatters: Phaser.GameObjects.Group = this.scene.bloodSplatters;
        let bloodSplatter = bloodSplatters.get( x, y ).setVisible( true ).setActive( true ).setRotation( rotation );
        bloodSplatter.on(
            'animationcomplete-default',
            () => bloodSplatters.killAndHide( bloodSplatter )
        );
        bloodSplatter.play( 'default' );
        this.group.killAndHide( this );
    }

    reset() {
        this
            .setActive( true )
            .setDepth( 1 )
            .setVisible( true )
            .health = this.maxHealth;

        return this;
    }

}