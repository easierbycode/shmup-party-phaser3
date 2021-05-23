
import { Bullet, Weapon } from "./weapon-plugin";
import { KillType } from "./weapon-plugin/consts";
import { BULLET_KILL, WEAPON_FIRE } from "./weapon-plugin/events";
import { config } from './config';
const SPRITE_KEY = 'barrier';


class _Bullet extends Bullet {

      damagePoints = 50;

      constructor( scene, x, y, key = SPRITE_KEY, frame ) {
            super( scene, x, y, key, frame );
            this.setData( 'killType', KillType.KILL_LIFESPAN );
      }

      damage( bullet: _Bullet, entity ) {}

      kill() { super.kill() }

      update() {
          super.update();
          let {x, y} = this;
          if ( x !== 0 && !this.getData( 'player' ).inputEnabled ) {
            this.getData( 'player' ).setPosition( x, y );
          }
      }

}


export default class Barrier extends Weapon {

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        scene: Phaser.Scene,
        bulletLimit: number = 1,
        key = '',
        frame = '',
        group?: Phaser.GameObjects.Group
      ) {
            super( scene, bulletLimit, key, frame );

            this.addBulletAnimation(
                  `${SPRITE_KEY}.default`,
                  scene.anims.generateFrameNumbers( SPRITE_KEY ),
                  60,
                  -1
            )
            
            this.bulletClass    = _Bullet;
            this.bulletLifespan = 350;
            this.bulletKillType = KillType.KILL_LIFESPAN;
            this.bulletSpeed    = 900;
            this.fireRate       = 1500;
            this.debugPhysics   = config.physics[config.physics.default].debug;

            // `this.bullets` exists only after createBullets()
            this.createBullets();
            // createBullets does not create bulletClass instances, so
            // we remove and recreate with correct classType
            this.bullets.clear();

            this.bullets.createMultipleCallback = ( items ) => {
                  items.forEach( item => {
                        item.setData( 'bulletManager', this );
                        item.setData( 'player', player );
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

            this.on(WEAPON_FIRE, ( bullet: Bullet, weapon: Weapon ) => {
                bullet.getData( 'player' ).inputEnabled = false;
            });

            this.on(BULLET_KILL, ( bullet: Bullet, weapon: Weapon ) => {
                bullet.getData( 'player' ).inputEnabled = true;
            });
      }

}