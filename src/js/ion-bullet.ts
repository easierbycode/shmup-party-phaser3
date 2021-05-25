
import { Bullet, Weapon } from "./weapon-plugin";
import { KillType } from "./weapon-plugin/consts";
import { config } from './config';
import BaseEntity from "./base-entity";
const SPRITE_KEY = 'ion-bullet';


class _Bullet extends Bullet {

      damagePoints = 100;

      constructor( scene, x, y, key = SPRITE_KEY, frame ) {
            super( scene, x, y, key, frame );
            this.setData( 'killType', KillType.KILL_WORLD_BOUNDS );
      }

      damage( bullet: _Bullet, entity: BaseEntity ) {
            super.kill()
            let {x, y}        = entity;
            let {impacts}     = this.getData( 'bulletManager' );
            let impact        = impacts.get( x, y ).setVisible( true ).setActive( true ).setDepth( 1 );
            impact.on(
                'animationcomplete-default',
                () => impacts.killAndHide( impact )
            );
            impact.play( 'default' );
      }

}


class BulletImpact extends Phaser.GameObjects.Sprite {

      constructor(
          scene: Phaser.Scene, 
          x: number, 
          y: number, 
          key: string = 'ion-bullet-impact'
      ) {
          super( scene, x, y, key )
  
          this.anims.create({
              key: 'default',
              frames: this.anims.generateFrameNames( 'ion-bullet-impact' ),
              frameRate: 30
          })
      }
  
}


export default class IonBullet extends Weapon {

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        scene: Phaser.Scene,
        bulletLimit: number = 20,
        key = '',
        frame = '',
        group?: Phaser.GameObjects.Group
      ) {
            super( scene, bulletLimit, key, frame );

            this.impacts = scene.add.group({ classType: BulletImpact });

            this.addBulletAnimation(
                  `${SPRITE_KEY}.default`,
                  scene.anims.generateFrameNumbers( SPRITE_KEY ),
                  20,
                  -1
            )
            
            this.bulletClass  = _Bullet;
            this.bulletSpeed  = 350;
            this.fireRate     = 300;
            this.bulletAngleOffset = 180;
            this.debugPhysics = config.physics[config.physics.default].debug;

            // `this.bullets` exists only after createBullets()
            this.createBullets();
            // createBullets does not create bulletClass instances, so
            // we remove and recreate with correct classType
            this.bullets.clear();

            this.bullets.createMultipleCallback = ( items ) => {
                  items.forEach( item => {
                        item.setData( 'bulletManager', this );
                        item.setOrigin( 0.25, 0.5 );
                        // item.body.setSize( 22, 18 );
                        // item.body.setOffset( 4, 6 );
                        item.body.setSize( 25, 28 );
                        item.body.setOffset( 1, 1 );
                  });
            }

            this.bullets.createMultiple({
                  classType: _Bullet,
                  key: SPRITE_KEY,
                  repeat: this.bullets.maxSize-1,
                  active: false,
                  visible: false
            });

            this.trackSprite( player, 0, 0, true );
      }

}