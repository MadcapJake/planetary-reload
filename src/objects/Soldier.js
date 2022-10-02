import Phaser from 'phaser'

import CONFIG from '../config.js'

class Soldier extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 0, 0, 'soldier');

    this.isPlayer = false;
    
    // TODO: pick team
    this.team = 'purple';

    // TODO: place in the world
    this.x = 0;
    this.y = 0;

    this.health = 3;

    // TODO: implement 10 second recharge
    this.charge = 10;

    this.lastFired = 0;    

    this.target = this.scene.player;
  }

  update(time, delta) {
    if (this.isPlayer) constrainVelocity(this, 200);

    // TODO: detectFire
    if (!this.isPlayer) enemyFire(this, this.scene.lasers, this.target, time);

    // TODO: implement target based on enemyDetection

    // rotates soldier to face towards target
    const {x: targetX, y: targetY} = this.isPlayer ? this.scene.reticle : this.target;
    this.rotation = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    // TODO: implement soldier AI movement
  }

  setObjective(type, region) {
    switch(type) {
      case 'patrol': break;
      case 'assault': break;
      default: throw new Error("Not a valid objective");
    }
  }

  // adds keybindings
  setPlayer() {
    this.isPlayer = true
    const keyW = this.scene.input.keyboard.addKey('W');
    const keyA = this.scene.input.keyboard.addKey('A');
    const keyS = this.scene.input.keyboard.addKey('S');
    const keyD = this.scene.input.keyboard.addKey('D');
    
    // Enables movement of player with WASD keys
    keyW.on('down', () => {
      if (this.body.velocity.y > 0) this.body.velocity.y = 0;
      this.body.setAccelerationY(-800);
    });
    keyA.on('down', () => {
      if (this.body.velocity.x > 0) this.body.velocity.x = 0;
      this.body.setAccelerationX(-800);
    });
    keyS.on('down', () => {
      if (this.body.velocity.y < 0) this.body.velocity.y = 0;
      this.body.setAccelerationY( 800);
    });
    keyD.on('down', () => {
      if (this.body.velocity.x < 0) this.body.velocity.x = 0;
      this.body.setAccelerationX( 800);
    });

    // Stops player acceleration on up-press of WASD keys
    keyW.on('up', () => keyW.isUp && this.body.setAccelerationY(0));
    keyA.on('up', () => keyA.isUp && this.body.setAccelerationX(0));
    keyS.on('up', () => keyS.isUp && this.body.setAccelerationY(0));
    keyD.on('up', () => keyD.isUp && this.body.setAccelerationX(0));

    return this;
  }

  performDetection() {

  }

  // patrol
  // engage
  // 
  performObjective() {

  }
}

// ensure sprite speed doesn't exceed max velocity while update is called
function constrainVelocity(sprite, maxVelocity) {
    if (!sprite || !sprite.body) return;
  
    let vx = sprite.body.velocity.x,
        vy = sprite.body.velocity.y;
    const currVelocitySqr = vx * vx + vy * vy;
  
    if (currVelocitySqr > maxVelocity * maxVelocity) {
      const angle = Math.atan2(vy, vx);
      vx = Math.cos(angle) * maxVelocity;
      vy = Math.sin(angle) * maxVelocity;
      sprite.body.velocity.x = vx;
      sprite.body.velocity.y = vy;
    }
}
  
function enemyFire(enemy, lasers, player, time) {
  if (enemy.active === false) return;
  if ((time - enemy.lastFired) > 1000) {
    enemy.lastFired = time;
    let laser = lasers.get().setActive(true).setVisible(true);
    if (laser) laser.fire(enemy, player);
  }
}

export default Soldier;