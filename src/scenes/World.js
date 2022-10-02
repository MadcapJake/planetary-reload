import Phaser from 'phaser'

import CONFIG from '../config.js'

import {SoldierBlue, SoldierGold, SoldierPurple} from '../objects/Soldier.js'
import Laser from '../objects/Laser.js'

class WorldScene extends Phaser.Scene {
  preload () {
    // Loading is done in 'StartScene'
    // - 'sky' is background image
    // - 'red' is our particle
    // - 'logo' is the phaser3 logo
  }

  create () {
    this.reticle = this.physics.add.sprite(0, 0, 'target.png');

    this.soldiersGold = this.physics.add.group({ classType: SoldierGold, runChildUpdate: true });
    this.soldiersPurple = this.physics.add.group({ classType: SoldierPurple, runChildUpdate: true });
    this.soldiersBlue = this.physics.add.group({ classType: SoldierBlue, runChildUpdate: true });

    this.lasers = this.physics.add.group({ classType: Laser,   runChildUpdate: true });

    // const data = new Array(100)
    //   .fill(new Array(100))
    //   .map((row) => row.map((cell) => Math.floor(Math.random() * 2)));
    this.map = this.add.tilemap('main.json');
    
    this.map.addTilesetImage('map_tiles', 'main.png');
    const ground    = this.map.createLayer(0, 'map_tiles').setVisible(true);
    const obstacles = this.map.createLayer(1, 'map_tiles').setVisible(true);
    const trees     = this.map.createLayer(2, 'map_tiles').setVisible(true);
    const foliage   = this.map.createLayer(3, 'map_tiles').setVisible(true);
    const territory = this.map.createLayer(4, 'map_tiles').setVisible(true);

    this.reticle
      .setOrigin(0.5, 0.5)
      .setDisplaySize(25, 25)
      .setCollideWorldBounds(true);
    
    this.player = this.soldiersGold.get().setActive(true).setVisible(true);
    this.player.setPlayer().setOrigin(0.5, 0.5).setDisplaySize(132, 120).setPosition(2000, 300);
    this.player.body.setCollideWorldBounds(true).setDrag(1500, 1500);

    this.soldiersPurple.createFromConfig({
      key: 'soldier-purple.png',
      repeat: 5,
      setOrigin: {x: 0.5, y: 0.5},  
      setXY: {x: 400, y: 400, stepX: 400, stepY: 400},
      setScale: { x: 2, y: 2 }
    });


    // Create and configure a particle emitter
    // const particles = this.add.particles('red')
    // const emitter = particles.createEmitter({
    //   speed: 100,
    //   scale: { start: 1, end: 0 },
    //   blendMode: 'ADD'
    // })

    // Create and animate the logo
    // const logo = this.physics.add.image(400, 100, 'logo')
    // logo.setVelocity(100, 200)
    // logo.setBounce(1, 1)
    // logo.setCollideWorldBounds(true)
    // logo.body.onWorldBounds = true

    // Play sound when we hit the world bounds
    // this.physics.world.on('worldbounds', () => { this.sfx.play('hitSound') }, this)

    // Adjust world bounds for physics and camera
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    this.cameras.main.ignore(territory);
    // this.cameras.main.setDeadzone(worldWidth * 0.25, worldHeight)

    // Make the particle emitter follow the logo
    // emitter.startFollow(logo)

    // Add a callback when a key is released
    // this.input.keyboard.on('keyup', this.keyReleased, this)

    // // Load and play background music
    // this.music = this.sound.addAudioSprite('gameAudio')
    // this.music.play('freeVertexStudioTrack2')

    // // Create a sound instance for sfx
    // this.sfx = this.sound.addAudioSprite('gameAudio')

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

    this.reticle.body.velocity.x = this.player.body.velocity.x;
    this.reticle.body.velocity.y = this.player.body.velocity.y;

    constrainReticle(this.player, this.reticle);

  }

  // keyReleased () {
  //   console.log('Key released')
  //   this.scene.start('StartScene')
  //   this.scene.stop('HUDScene')
  //   this.music.stop()
  // }
}



// ensure reticle cannot be moved offscreen
function constrainReticle(player, reticle) {
  const {DEFAULT_WIDTH: width, DEFAULT_HEIGHT: height} = CONFIG;
  const distX = reticle.x - player.x, distY = reticle.y - player.y;
  
  if      (distX >  width)  reticle.x = player.x + width;
  else if (distX < -width)  reticle.x = player.x - width;

  if      (distY >  height) reticle.y = player.y + height;
  else if (distY < -height) reticle.y = player.y - height;
}


export default WorldScene
