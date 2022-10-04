import Phaser from 'phaser'

import CONFIG from '../config.js'

class SmoothedControls {
  constructor(controller, speed) {
    this.msSpeed = speed;
    this.value = 0;
  }
  moveLeft(delta) {
    if (this.value > 0) this.reset();
    this.value -= this.msSpeed * delta;
    if (this.value < 1) this.value = -1;
    // controller.time.rightDown += delta;
  }
  moveRight(delta) {
    if (this.value < 0) this.reset();
    this.value += this.msSpeed * delta;
    if (this.value > 1) this.value = 1;
  }
  moveUp(delta) {
    if (this.value > 0) this.reset();
    this.value -= this.msSpeed * delta;
    if (this.value < 1) this.value = -1;
  }
  moveDown(delta) {
    if (this.value < 0) this.reset();
    this.value += this.msSpeed * delta;
    if (this.value > 1) this.value = 1;
  }
  reset() { this.value = 0; }
}

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
      CONFIG.CATEGORY.LASER
    ]);
    // let new_bod = Phaser.Physics.Matter.Matter.Bodies.rectangle(
    //   0, // x (has no impact)
    //   0, // y (has no impact)
    //   this.width - 35,
    //   this.height - 20,
    //   { chamfer: { radius: 10 }}
    // );
    // console.log(new_bod);
    // this.setExistingBody(new_bod);

    this.isPlayer = false;
    
    this.team = kind;

    this.health = 3;

    this.speed = {run: 10, walk: 7};

    // TODO: implement 10 second recharge
    this.charge = 10;

    this.lastFired = 0;    

    // TODO: update detection logic
    this.target = this.scene.player;

    this.smooth = new SmoothedControls(this, 0.0005);
  }

  transitionVelocity(sign, axis) {
    let old = this.body.velocity[axis], target = sign * this.speed.walk;
    return Phaser.Math.Linear(old, target, sign * this.smooth.value);
  }

  update(time, delta) {

    // TODO: fix the jumpiness when going back and forth
    if (this.isPlayer) {
      if (this.keyA.isDown) {
        this.smooth.moveLeft(delta);
        this.setVelocityX(this.transitionVelocity(-1, 'x'));
      } else if (this.keyD.isDown) {
        this.smooth.moveRight(delta);
        this.setVelocityX(this.transitionVelocity( 1, 'x'));
      }
      if (this.keyW.isDown) {
        this.smooth.moveUp(delta);
        this.setVelocityY(this.transitionVelocity(-1, 'y'));
      } else if (this.keyS.isDown) {
        this.smooth.moveDown(delta);
        this.setVelocityY(this.transitionVelocity( 1, 'y'));
      } else { this.smooth.reset() }

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

    this.setCollidesWith([
      CONFIG.CATEGORY.SOLDIER,
      CONFIG.CATEGORY.LASER,
      CONFIG.CATEGORY.CANOPY // to support transparent canopies
    ]);

    this.smoothMoveCameraTowardsMe();

    this.keyW = this.scene.input.keyboard.addKey('W');
    this.keyA = this.scene.input.keyboard.addKey('A');
    this.keyS = this.scene.input.keyboard.addKey('S');
    this.keyD = this.scene.input.keyboard.addKey('D');

    return this;
  }

  performDetection() {

  }

  // patrol
  // engage
  // 
  performObjective() {

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