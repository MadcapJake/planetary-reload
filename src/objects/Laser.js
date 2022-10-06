import Phaser from 'phaser'

import CONFIG from '../config.js'

class Laser extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 0, 0, 'laser_bolt.png');
    this.scene.matter.add.gameObject(this, {
      label: 'LaserBody',
      // chamfer: { radius: 4},
      shape: {
        type: 'rectangle',
        width: this.width,
        height: this.height,
      },
      restitution: 0.5
    })
    this.speed = 2;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.setOrigin(0);
    this.setDepth(1);
    this.setDisplaySize(12, 12);
    this.setCollisionCategory(CONFIG.CATEGORY.LASER);
    this.setCollidesWith([
      CONFIG.CATEGORY.SOLDIER,
      CONFIG.CATEGORY.OBSTACLE
    ])
    this.setOnCollide(() => {
      // A body may collide with multiple other bodies in a step, so we'll use a flag to
      // only tween & destroy the lsaer once.
      if (this.isBeingDestroyed) return;
      
      this.isBeingDestroyed = true;

      this.setMass(Infinity);
      // this.body.allowGravity = false;
      // this.body.inertia = -this.body.inertia;
      this.setVelocity(0);

      this.scene.tweens.add({
        targets: this,
        alpha: { value: 0, duration: 500, ease: 'Expo' },
        onComplete: () => this.destroy()
      });
    });
  }

  fire(shooter, target) {
    this.setPosition(shooter.x, shooter.y); // init position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

    // Calculate x & y velocity of laser to move from shooter to target
    if (target.y >= this.y) {
      this.xSpeed =  this.speed * Math.sin(this.direction);
      this.ySpeed =  this.speed * Math.cos(this.direction);
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction);
      this.ySpeed = -this.speed * Math.cos(this.direction);
    }

    // start the laser a little ways off from center to prevent early collisions
    this.x += this.xSpeed * 5;
    this.y += this.ySpeed * 5;

    this.rotation = shooter.rotation; // angle laser with shooters rotation
    
    this.born = 0; // time since new laser spawned

    this.setActive(true);
    this.setVisible(true);

    // this.scene.physics.add.collider(
    //   [this.scene.soldiersGold, this.scene.soldiersPurple, this.scene.soldiersBlue],
    //   this,
    //   enemyHitCallback.bind(this.scene)
    // );
  }

  update(time, delta) {
    this.x += this.xSpeed * delta; this.y += this.ySpeed * delta; this.born += delta;
    if (this.born > 1800) { this.setActive(false); this.setVisible(false) }
  }
}

function enemyHitCallback(laserHit, enemyHit) {
  // reduce health of enemy
  if (laserHit.active === true && enemyHit.active === true) {
    enemyHit.health = enemyHit.health - 1;

    // kill enemy if health <= 0
    if (enemyHit.isPlayer) this.scene.get('HUDScene').loseHealth(enemyHit.health);
    if (enemyHit.health <= 0) enemyHit.setActive(false).setVisible(false);

    // destroy bullet
    laserHit.setActive(false).setVisible(false);
  }
}

export default Laser