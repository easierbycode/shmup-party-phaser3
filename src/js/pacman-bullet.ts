
import { Bullet, Weapon } from "./weapon-plugin";
import { KillType } from "./weapon-plugin/consts";
import { config } from './config';


class _Bullet extends Bullet {

      damagePoints = 50;

      constructor( scene, x, y, key = 'pacman-bullet', frame ) {
            super( scene, x, y, key, frame );
            this.body.setCircle( this.width / 2 );
            this.setData( 'killType', KillType.KILL_WORLD_BOUNDS );
      }

      damage( bullet: _Bullet, entity ) {}

}


export default class PacmanBullet extends Weapon {

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        scene: Phaser.Scene,
        bulletLimit: number = 10,
        key = '',
        frame = '',
        group?: Phaser.GameObjects.Group
      ) {
            super( scene, bulletLimit, key, frame );

            this.addBulletAnimation(
                  'pacman-bullet.chomp',
                  scene.anims.generateFrameNumbers( 'pacman-bullet' ),
                  12,
                  -1
            )
            
            this.bulletClass  = _Bullet;
            this.bulletSpeed  = 600;
            this.fireRate     = 600;
            this.debugPhysics = config.physics[config.physics.default].debug;

            // `this.bullets` exists only after createBullets()
            this.createBullets();
            // createBullets does not create bulletClass instances, so
            // we remove and recreate with correct classType
            this.bullets.clear();

            this.bullets.createMultipleCallback = ( items ) => {
                  items.forEach( item => {
                        item.setData( 'bulletManager', this );
                  });
            }

            this.bullets.createMultiple({
                  classType: _Bullet,
                  key: 'pacman-bullet',
                  repeat: this.bullets.maxSize-1,
                  active: false,
                  visible: false
            });

            this.trackSprite( player, 0, 0, true );
      }
}