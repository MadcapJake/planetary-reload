import Phaser from 'phaser'

import CONFIG from '../config.js'

import Soldier from '../objects/Soldier.js'
import Laser from '../objects/Laser.js'

class WorldScene extends Phaser.Scene {
  preload () {
    // Loading is done in 'StartScene'
    // - 'sky' is background image
    // - 'red' is our particle
    // - 'logo' is the phaser3 logo
  }

  create () {
    this.reticle  = this.physics.add.sprite(10, 10, 'target');
    this.soldiers = this.physics.add.group({ classType: Soldier, runChildUpdate: true });
    this.lasers   = this.physics.add.group({ classType: Laser, runChildUpdate: true });

    const data    = new Array(100).fill(new Array(100).fill(0));
    this.map      = this.make.tilemap({
      data,
      tileHeight: 750,
      tileWidth: 750,
      width: 100,
      height: 100
    });
    this.map.addTilesetImage('grass');
    this.map.addTilesetImage('factions');
    const ground = this.map.createBlankLayer('ground', 'grass');
    ground.fill(0).setVisible(true);
    const territory = this.map.createBlankLayer('territory', 'factions');
    territory.randomize(undefined, undefined, undefined, undefined, [1,2,3]).setVisible(true);
    console.log(this.map);
    const worldWidth  = CONFIG.DEFAULT_WIDTH * 10,
          worldHeight = CONFIG.DEFAULT_HEIGHT * 10;

    // this.background.setOrigin(0, 0).setDisplaySize(worldWidth, worldHeight);
    this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
    
    this.player = this.soldiers.get().setActive(true).setVisible(true);
    this.player.setPlayer().setOrigin(0.5, 0.5).setDisplaySize(132, 120);
    this.player.body.setCollideWorldBounds(true).setDrag(1500, 1500);

    for (var soldierID of [1, 2, 3]) {
      let soldier = this.soldiers.get().setActive(true).setVisible(true);
      soldier.setOrigin(0.5 * soldierID, 0.5 * soldierID).setDisplaySize(132, 120)
      soldier.body.setCollideWorldBounds(true);
    }


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
    const { reticle } = this.scene.get('HUDScene');

    reticle.body.velocity.x = this.player.body.velocity.x;
    reticle.body.velocity.y = this.player.body.velocity.y;

    constrainReticle(this.player, reticle);

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
