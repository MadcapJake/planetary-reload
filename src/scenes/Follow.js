import Phaser from 'phaser'

import CONFIG from '../config.js'

import Laser from '../objects/Laser.js'

class FollowScene extends Phaser.Scene {
  preload () {
    // Loading is done in 'StartScene'
    // - 'sky' is background image
    // - 'red' is our particle
    // - 'logo' is the phaser3 logo
  }

  create () {
    this.playerLasers = this.physics.add.group({ classType: Laser, runChildUpdate: true });
    this.enemyLasers  = this.physics.add.group({ classType: Laser, runChildUpdate: true });
    this.background   = this.add.image(CONFIG.DEFAULT_WIDTH, CONFIG.DEFAULT_HEIGHT, 'background');
    this.player       = this.physics.add.sprite(CONFIG.DEFAULT_WIDTH, CONFIG.DEFAULT_HEIGHT, 'player');
    this.enemy        = this.physics.add.sprite(300, 600, 'enemy');
    this.reticle      = this.physics.add.sprite(10, 10, 'target');

    this.background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
    this.player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
    this.enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
    this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);


    
    // Add background image
    // const sky = this.add.image(CONFIG.DEFAULT_WIDTH / 2, CONFIG.DEFAULT_HEIGHT / 2, 'sky')
    // sky.setScale(
    //   CONFIG.DEFAULT_WIDTH / sky.width * 1.5,
    //   CONFIG.DEFAULT_HEIGHT / sky.height
    // )

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
    const worldWidth  = CONFIG.DEFAULT_WIDTH * 1.5,
          worldHeight = CONFIG.DEFAULT_HEIGHT;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    // this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(this.player)
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

    this.player.health = 3;
    this.enemy.health = 3;
    this.enemy.lastFired = 0;
    
    const keyW = this.input.keyboard.addKey('W'),
          keyA = this.input.keyboard.addKey('A'),
          keyS = this.input.keyboard.addKey('S'),
          keyD = this.input.keyboard.addKey('D');

    // Enables movement of player with WASD keys
    keyW.on('down', () => this.player.setAccelerationY(-800));
    keyA.on('down', () => this.player.setAccelerationX(-800));
    keyS.on('down', () => this.player.setAccelerationY( 800));
    keyD.on('down', () => this.player.setAccelerationX( 800));

    // Stops player acceleration on up-press of WASD keys
    keyW.on('up', () => keyW.isUp && this.player.setAccelerationY(0));
    keyA.on('up', () => keyA.isUp && this.player.setAccelerationX(0));
    keyS.on('up', () => keyS.isUp && this.player.setAccelerationY(0));
    keyD.on('up', () => keyD.isUp && this.player.setAccelerationX(0));


    // Fires laser from player on left click of mouse
    this.input.on('pointerdown', (pointer, time, lastFired) => {
      if (this.player.active === false) return;
      const laser = this.playerLasers.get().setActive(true).setVisible(true);
      if (laser) {
        laser.fire(this.player, this.reticle);
        this.physics.add.collider(this.enemy, laser, enemyHitCallback);
      }
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
    // rotates player to face towards reticle
    this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, reticle.x, reticle.y);

    // rotates enemy to face towards player
    this.enemy.rotation  = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);

    reticle.body.velocity.x = this.player.body.velocity.x;
    reticle.body.velocity.y = this.player.body.velocity.y;

    constrainVelocity(this.player, 500);

    enemyFire(this.enemy, this.enemyLasers, this.player, time, this);
  }

  // keyReleased () {
  //   console.log('Key released')
  //   this.scene.start('StartScene')
  //   this.scene.stop('HUDScene')
  //   this.music.stop()
  // }
}

function enemyHitCallback(enemyHit, laserHit) {
  // reduce health of enemy
  if (laserHit.active === true && enemyHit.active === true) {
    enemyHit.health = enemyHit.health - 1;
    console.log("Enemy hp: ", enemyHit.health);

    // kill enemy if health <= 0
    if (enemyHit.health <= 0) enemyHit.setActive(false).setVisible(false);

    // destroy bullet
    laserHit.setActive(false).setVisible(false);
  }
}

function playerHitCallback(playerHit, laserHit) {
  // reduce health of the player
  if (laserHit.active === true && playerHit.active === true) {
    playerHit.health = playerHit.health - 1;
    console.log("Player hp: ", playerHit.health);

    // kill hp sprites and kill player if health <= 0
    this.scene.get('HUDScene').loseHealth(playerHit.health);
    // TODO: Game over!

    // destroy bullet
    laserHit.setActive(false).setVisible(false);
  }
}

function enemyFire(enemy, lasers, player, time, gameObject) {
  if (enemy.active === false) return;
  if ((time - enemy.lastFired) > 1000) {
    enemy.lastFired = time;
    
    // get laser from lasers group
    let laser = lasers.get().setActive(true).setVisible(true);
    if (laser) {
      laser.fire(enemy, player);
      // add collider between laser and player
      gameObject.physics.add.collider(player, laser, playerHitCallback.bind(gameObject));
    }
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

// ensure reticle does not move offscreen


export default FollowScene
