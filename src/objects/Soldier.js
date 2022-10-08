import Phaser from 'phaser'

import CONFIG from '../config.js'

class Soldier extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, kind) {
    super(scene, x, y, `soldier-${kind}.png`);
    this.scene.matter.add.gameObject(this,  {
      label: 'SoldierBody',
      chamfer: { radius: 12 },
      shape: {
        type: 'rectangle',
        width: this.width - 46,
        height: this.height - 25,
      },
    });
    this.setOrigin(0.37, 0.5);
    this.setDisplaySize(132, 120);
    this.setDepth(1);
    this.setCollisionCategory(CONFIG.CATEGORY.SOLDIER);
    this.setCollidesWith([
      CONFIG.CATEGORY.SOLDIER,
      CONFIG.CATEGORY.LASER,
      CONFIG.CATEGORY.OBSTACLE
    ]);
    
    this.isPlayer = false;
    
    this.team = kind;

    this.health = 3;

    this.speed = 0.0015;

    // TODO: implement 10 second recharge
    this.charge = 10;

    this.lastFired = 0;    
    // TODO: update detection logic
    this.target = this.scene.player;

  }



  update(time, delta) {

    // TODO: fix the jumpiness when going back and forth
    if (this.isPlayer) {
      if (this.keyA.isDown) this.legs.thrustLeft(this.speed)
      else if (this.keyD.isDown) this.legs.thrustRight(this.speed);
      if (this.keyW.isDown) this.legs.thrust(this.speed);
      else if (this.keyS.isDown) this.legs.thrustBack(this.speed);

      this.smoothMoveCameraTowardsMe(0.9);
    }


    // TODO: detectFire
    // if (!this.isPlayer) enemyFire(this, this.scene.lasers, this.target, time);

    // TODO: implement target based on enemyDetection

    // rotates soldier to face towards target
    const {x: targetX, y: targetY} = this.isPlayer ? this.scene.reticle : this.target.getCenter();

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

    this.body.label = 'PlayerBody';

    this.smoothMoveCameraTowardsMe();

    this.keyW = this.scene.input.keyboard.addKey('W');
    this.keyA = this.scene.input.keyboard.addKey('A');
    this.keyS = this.scene.input.keyboard.addKey('S');
    this.keyD = this.scene.input.keyboard.addKey('D');

    this.legs = this.scene.matter.add.image(
      this.x,
      this.y,
      '',
      undefined,
      {isSensor: true}
    );
    this.legs.setAngle(-90);
    this.scene.matter.add.joint(this, this.legs, 0, 1);

    return this;
  }

  performDetection() {

  }

  // patrol
  // engage
  // 
  performObjective() {

  }

  receiveLaserHit() {
    this.health -= 1;
    if (this.health == 0) this.destroy();
  }

  smoothMoveCameraTowardsMe(smoothFactor = 0) {
    let cam = this.scene.cameras.main;
    cam.scrollX = smoothFactor * cam.scrollX + (1 - smoothFactor) * (this.x - cam.width  * 0.5);
    cam.scrollY = smoothFactor * cam.scrollY + (1 - smoothFactor) * (this.y - cam.height * 0.5);
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

export class SoldierBlue extends Soldier {
  constructor(world, x, y) { super(world, x, y, 'blue') }
}
export class SoldierGold extends Soldier {
  constructor(world, x, y) { super(world, x, y, 'gold') }
}
export class SoldierPurple extends Soldier {
  constructor(world, x, y) { super(world, x, y, 'purple') }
}