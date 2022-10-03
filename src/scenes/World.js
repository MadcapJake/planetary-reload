import Phaser from 'phaser'

import CONFIG from '../config.js'

import {SoldierBlue, SoldierGold, SoldierPurple} from '../objects/Soldier.js'
import Laser from '../objects/Laser.js'

class WorldScene extends Phaser.Scene {
  preload () {}
  create () {
    this.reticle = this.matter.add.image(0, 0, 'target.png');
    this.reticle.setOrigin(0.5, 0.5)
      .setDisplaySize(35, 35)
      .setSensor(true)
      .setDepth(3)
      .setFixedRotation();

    this.map = this.add.tilemap('main.tmj');
    const tileset   = this.map.addTilesetImage('map_tiles', 'main.png');
    const ground    = this.map.createLayer('Ground',    'map_tiles'); 
    const obstacles = this.map.createLayer('Obstacles', 'map_tiles');
    const trees     = this.map.createLayer('Trees',     'map_tiles');
    const canopy    = this.map.createLayer('Canopy',    'map_tiles');
    const territory = this.map.createLayer('Territory', 'map_tiles');

    ground.setDepth(0);
    obstacles.setDepth(1);
    trees.setDepth(1);
    canopy.setDepth(2);
    territory.setDepth(3);

    this.map.setCollisionByProperty({collides: true}, true, true, obstacles);
    this.map.setCollisionByProperty({collides: true}, true, true, trees);
    this.map.setCollisionByProperty({obfuscates: true}, true, true, canopy);

    this.matter.world.convertTilemapLayer(obstacles);
    this.matter.world.convertTilemapLayer(trees);
    this.matter.world.convertTilemapLayer(canopy);

    canopy.forEachTile(tile => {
      if (tile.properties.obfuscates){ 
        tile.physics.matterBody.body.label = 'ObfuscatingBody';
        tile.physics.matterBody.setCollisionCategory(CONFIG.CATEGORY.CANOPY);
        tile.physics.matterBody.setCollidesWith(CONFIG.CATEGORY.SOLDIER);
      }
    });
    
    this.soldiersGold   = this.add.group({ classType: SoldierGold,   runChildUpdate: true });
    this.soldiersPurple = this.add.group({ classType: SoldierPurple, runChildUpdate: true });
    this.soldiersBlue   = this.add.group({ classType: SoldierBlue,   runChildUpdate: true });
    this.lasers         = this.add.group({ classType: Laser,         runChildUpdate: true });
    
    this.player = this.soldiersGold.get()
      .setPlayer()
      .setPosition(2000, 300)
      .setActive(true)
      .setVisible(true);

    for (let s of [1,2,3,4]) {
      this.soldiersBlue.get()
        .setPosition(500 * s, 500 * s)
        .setActive(true)
        .setVisible(true);
    }

    this.matter.world.setBounds(this.map.widthInPixels, this.map.heightInPixels)
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    this.matter.world.debugGraphic.setVisible(true);

    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    this.cameras.main.roundPixels = true;
    this.cameras.main.ignore(territory);

    // Fires laser from player on left click of mouse
    this.input.on('pointerdown', (pointer, time, lastFired) => {
      if (this.player.active === false) return;
      const laser = this.lasers.get().setActive(true).setVisible(true);
      if (laser) laser.fire(this.player, this.reticle);
    });

    // Pointer lock will only wrk after a mousedown
    this.sys.game.canvas.addEventListener('mousedown', () => this.sys.game.input.mouse.requestPointerLock());

    // Exit pointer lock when Q or escape (by defualt) is pressed
    const keyQ = this.input.keyboard.addKey('Q');
    keyQ.on('down', () => this.sys.game.input.mouse.locked && this.sys.game.input.mouse.releasePointerLock());

    // move reticle upon locked pointer movement
    this.input.on('pointermove', (pointer) => {
      if (this.input.mouse.locked) {
        this.reticle.x += pointer.movementX;
        this.reticle.y += pointer.movementY;
      }
    });

    this.canopyObfuscator = {
      enabled: false,
      timeEnabled: 0,
      bodies: [],
      enable(time, gameObject) {
        this.enabled     = true;
        this.timeEnabled = time;
        if (!gameObject.tile.alpha) gameObject.tile.setAlpha(0.5);
        this.bodies.push(gameObject);
      },
      reset() {
        this.enabled = false;
        this.timeEnabled = 0;
        this.bodies.forEach(body => {
          console.log(body);
          body.tile.clearAlpha();
          body.tile.physics.matterBody.setSensor(false);
        })
        this.bodies = [];
      },
      delayPassed(time) {
        return this.timeEnabled < time - 500
      },
    }

    this.matter.world.on('collisionstart', event => {
      function getRootBody(body) {
        if (body.parent === body) return body;
        while (body.parent !== body) body = body.parent;
        return body;
      }
      for (let {bodyA, bodyB} of event.pairs) {
        bodyA = getRootBody(bodyA); bodyB = getRootBody(bodyB);
        if (bodyA.label === 'PlayerBody' && bodyB.label === 'ObfuscatingBody') {
          console.log("Under a tree!");
          bodyA.gameObject.setCollidesWith([
            CONFIG.CATEGORY.SOLDIER,
            CONFIG.CATEGORY.LASER
          ]);
          this.canopyObfuscator.enable(this.time.now, bodyB.gameObject);

        } else if (bodyA.label === 'ObfuscatingBody' && bodyB.label === 'PlayerBody') {
          console.log("Under a tree!");
          if (!bodyA.gameObject.tile.alpha) bodyA.gameObject.tile.setAlpha(0.2)
          bodyB.gameObject.setCollidesWith([
            CONFIG.CATEGORY.SOLDIER,
            CONFIG.CATEGORY.LASER
          ]);
          this.canopyObfuscator.enable(this.time.now, bodyA.gameObject);
   
        }
      }
    })

    this.scene.run('HUDScene')
  }

  update (time, delta) {
    this.reticle.setVelocityX(this.player.body.velocity.x);
    this.reticle.setVelocityY(this.player.body.velocity.y);
    constrainReticle(this.player, this.reticle);

    if (this.canopyObfuscator.enabled &&
        this.canopyObfuscator.delayPassed(this.time.now)) {
      if (!this.matter.overlap(this.player.body, this.canopyObfuscator.bodies)) {
        console.log('clearing canopy alpha...');          
        this.player.setCollidesWith([
          CONFIG.CATEGORY.SOLDIER,
          CONFIG.CATEGORY.LASER,
          CONFIG.CATEGORY.CANOPY // to support transparent canopies
        ]);
        this.canopyObfuscator.reset();
      }
    }
  }

}

// ensure reticle cannot be moved offscreen
function constrainReticle(player, reticle) {
  // TODO: fix boundaries to match camera
  const {DEFAULT_WIDTH: width, DEFAULT_HEIGHT: height} = CONFIG;
  const distX = reticle.x - player.x, distY = reticle.y - player.y;
  
  if      (distX >  width)  reticle.x = player.x + width;
  else if (distX < -width)  reticle.x = player.x - width;

  if      (distY >  height) reticle.y = player.y + height;
  else if (distY < -height) reticle.y = player.y - height;
}

export default WorldScene
