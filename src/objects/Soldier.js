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

class Soldier extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, kind) {
    super(scene.matter.world, x, y, `soldier-${kind}.png`);

    this.isPlayer = false;
    
    this.team = kind;

    this.health = 3;

    // TODO: implement 10 second recharge
    this.charge = 10;

    this.lastFired = 0;    

    // TODO: update detection logic
    this.target = this.scene.player;

    // Matter JS collision bodies and sensors
    this.blocked = {
      left: false,
      right: false,
      top: false,
      bottom: false
    }
    this.numTouching = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
    this.sensors = {
      left: null,
      right: null,
      top: null,
      bottom: null
    }
    this.time = {
      leftDown: 0,
      rightDown: 0,
      topDown: 0,
      bottomDown: 0
    }
    this.speed = {
      run: 10,
      walk: 7
    }
    const M = Phaser.Physics.Matter.Matter;
    let [w,  h ] = [this.width, this.height];
    let [sx, sy] = [w/2, h/2];

    let mainBody        = M.Bodies.rectangle(sx,     sy, w * 0.75, h, { chamfer: { radius: 10 }});
    this.sensors.left   = M.Bodies.rectangle(sx - w, h,  sx,       5, { isSensor: true });
    this.sensors.right  = M.Bodies.rectangle(sx + w, h,  sx,       5, { isSensor: true });
    this.sensors.top    = M.Bodies.rectangle(sx,     h,  sx - h,   5, { isSensor: true });
    this.sensors.bottom = M.Bodies.rectangle(sx,     h,  sx + h,   5, { isSensor: true });
    let compoundBody    = M.Body.create({
      parts: [mainBody, this.sensors.left, this.sensors.right, this.sensors.top, this.sensors.bottom],
      friction: 0.02,
      restitution: 0.05
    });
    this.setExistingBody(compoundBody);
    this.setPosition(x, y);

    // Matter events

    this.scene.matter.world.on('beforeupdate', (event) => {
      this.numTouching.left   = 0;
      this.numTouching.right  = 0;
      this.numTouching.top    = 0;
      this.numTouching.bottom = 0;
    });

    this.scene.matter.world.on('collisionactive', (event_pairs) => {
      function either({bodyA, bodyB}, other) { bodyA === other || bodyB === other }
      for (let event of event_pairs.pairs) {
        if (either(event, this.body)) continue;
        else if (either(event, this.sensors.left))   this.numTouching.left   += 1;
        else if (either(event, this.sensors.right))  this.numTouching.right  += 1;
        else if (either(event, this.sensors.top))    this.numTouching.top    += 1;
        else if (either(event, this.sensors.bottom)) this.numTouching.bottom += 1;
      }
    });

    this.scene.matter.world.on('afterupdate', (event) => {
      this.blocked.left   = this.numTouching.left   > 0;
      this.blocked.right  = this.numTouching.right  > 0;
      this.blocked.top    = this.numTouching.top    > 0;
      this.blocked.bottom = this.numTouching.bottom > 0;
    });

    this.scene.matter.add.gameObject(this);

    this.smooth = new SmoothedControls(this, 0.0005);
  }

  transitionVelocity(sign, axis) {
    let old = this.body.velocity[axis], target = sign * this.speed.walk;
    return Phaser.Math.Linear(old, target, sign * this.smooth.value);
  }

  update(time, delta) {
    // if (this.isPlayer) constrainVelocity(this, 400);

    // TODO: fix the jumpiness when going back and forth
    if (this.isPlayer) {
      if (this.keyA.isDown && !this.blocked.left) {
        this.smooth.moveLeft(delta);
        this.setVelocityX(this.transitionVelocity(-1, 'x'));
      } else if (this.keyD.isDown && !this.blocked.right) {
        this.smooth.moveRight(delta);
        this.setVelocityX(this.transitionVelocity( 1, 'x'));
      } else if (this.keyW.isDown && !this.blocked.top) {
        this.smooth.moveUp(delta);
        this.setVelocityY(this.transitionVelocity(-1, 'y'));
      } else if (this.keyS.isDown && !this.blocked.bottom) {
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

// ensure sprite speed doesn't exceed max velocity while update is called
// function constrainVelocity(sprite, maxVelocity) {
//     if (!sprite || !sprite.body) return;
  
//     let vx = sprite.body.velocity.x,
//         vy = sprite.body.velocity.y;
//     const currVelocitySqr = vx * vx + vy * vy;
  
//     if (currVelocitySqr > maxVelocity * maxVelocity) {
//       const angle = Math.atan2(vy, vx);
//       vx = Math.cos(angle) * maxVelocity;
//       vy = Math.sin(angle) * maxVelocity;
//       sprite.body.velocity.x = vx;
//       sprite.body.velocity.y = vy;
//     }
// }
  
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