
import { Bullet, Weapon } from "./weapon-plugin";
import { KillType } from "./weapon-plugin/consts";
import { config } from './config';
const SPRITE_KEY = 'ciga-bullet';


class _Bullet extends Bullet {

      damagePoints = 100;

      constructor( scene, x, y, key = SPRITE_KEY, frame ) {
            super( scene, x, y, key, frame );
            this.setData( 'killType', KillType.KILL_WORLD_BOUNDS );
      }

      damage( bullet: _Bullet, entity ) {
            super.kill()
      }

}


export default class CigaBullet extends Weapon {

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        scene: Phaser.Scene,
        bulletLimit: number = 20,
        key = '',
        frame = '',
        group?: Phaser.GameObjects.Group
      ) {
            super( scene, bulletLimit, key, frame );

            this.addBulletAnimation(
                  `${SPRITE_KEY}.default`,
                  scene.anims.generateFrameNumbers( SPRITE_KEY ),
                  8,
                  -1
            )
            
            this.bulletClass  = _Bullet;
            this.bulletSpeed  = 350;
            this.fireRate     = 300;
            this.bulletAngleOffset = 270;
            this.debugPhysics = config.physics[config.physics.default].debug;

            // `this.bullets` exists only after createBullets()
            this.createBullets();
            // createBullets does not create bulletClass instances, so
            // we remove and recreate with correct classType
            this.bullets.clear();

            this.bullets.createMultipleCallback = ( items ) => {
                  items.forEach( item => {
                        item.setData( 'bulletManager', this );
                        item.setScale( 2.4 );
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