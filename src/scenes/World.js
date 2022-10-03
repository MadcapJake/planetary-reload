import Phaser from 'phaser'

import CONFIG from '../config.js'

import {SoldierBlue, SoldierGold, SoldierPurple} from '../objects/Soldier.js'
import Laser from '../objects/Laser.js'

class WorldScene extends Phaser.Scene {
  preload () {}
  create () {
    this.reticle = this.matter.add.sprite(0, 0, 'target.png');
    this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25);

    this.map = this.add.tilemap('main.tmj');
    const tileset   = this.map.addTilesetImage('map_tiles', 'main.png');
    const ground    = this.map.createLayer('Ground',    'map_tiles'); // .setVisible(true);
    const obstacles = this.map.createLayer('Obstacles', 'map_tiles');
    const trees     = this.map.createLayer('Trees',     'map_tiles');
    const foliage   = this.map.createLayer('Foliage',   'map_tiles');
    const territory = this.map.createLayer('Territory', 'map_tiles');
    this.map.setCollisionByProperty({colliding: true});
    this.matter.world.convertTilemapLayer(obstacles);
    this.matter.world.convertTilemapLayer(trees);

    console.log(this.map);
    
    this.soldiersGold   = this.add.group({ classType: SoldierGold,   runChildUpdate: true });
    this.soldiersPurple = this.add.group({ classType: SoldierPurple, runChildUpdate: true });
    this.soldiersBlue   = this.add.group({ classType: SoldierBlue,   runChildUpdate: true });
    this.lasers         = this.add.group({ classType: Laser,         runChildUpdate: true });
    
    this.player = this.soldiersGold.get().setActive(true).setVisible(true);
    this.player.setPlayer()
      .setOrigin(0.5, 0.5)
      .setDisplaySize(132, 120)
      .setPosition(2000, 300);

    this.soldiersPurple.createFromConfig({
      key: 'soldier-purple.png',
      repeat: 5,
      setOrigin: {x: 0.5, y: 0.5},  
      setXY: {x: 400, y: 400, stepX: 400, stepY: 400},
      setScale: { x: 2, y: 2 }
    });

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

    this.scene.run('HUDScene')
  }

  update (time, delta) {
    this.reticle.setVelocityX(this.player.body.velocity.x);
    this.reticle.setVelocityY(this.player.body.velocity.y);
    constrainReticle(this.player, this.reticle);
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
