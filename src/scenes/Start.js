import Phaser from 'phaser'
import CONFIG from '../config.js'

class StartScene extends Phaser.Scene {
  init () {
    this.loadingText = this.add.text(
      CONFIG.DEFAULT_WIDTH / 2,
      CONFIG.DEFAULT_HEIGHT / 2,
      'Loading ...', { font: '16pt Arial', color: '#FFFFFF', align: 'center' }
    )
    this.loadingText.setOrigin(0.5, 0.5)
  }

  preload () {
    // Load the image assets needed for THIS scene
    this.load.image('StartScreen',   'assets/StartScreen.png')

    // Load the image assets needed for 'WorldScene'
    this.load.spritesheet('soldier-blue.png',   'assets/sprites/soldier_blue.png',   { frameWidth: 66, frameHeight: 60 });
    this.load.spritesheet('soldier-gold.png',   'assets/sprites/soldier_gold.png',   { frameWidth: 66, frameHeight: 60 });
    this.load.spritesheet('soldier-purple.png', 'assets/sprites/soldier_purple.png', { frameWidth: 66, frameHeight: 60 });
    this.load.tilemapTiledJSON('main.json',     'assets/tilemaps/main.json');
    this.load.image('main.png',       'assets/backgrounds/main.png');
    this.load.image('target.png',     'assets/sprites/target.png');
    this.load.image('heart.png',      'assets/sprites/heart.png');    
    this.load.image('laser_bolt.png', 'assets/sprites/laser_bolt.png');
    this.load.image('factions.png',   'assets/backgrounds/factions.png');
    

    // Pre-load the entire audio sprite
    this.load.audioSprite('gameAudio', 'assets/audio/gameAudioSprite.json', [
      'assets/audio/gameAudioSprite.ogg',
      'assets/audio/gameAudioSprite.m4a',
      'assets/audio/gameAudioSprite.mp3',
      'assets/audio/gameAudioSprite.ac3'
    ])

    // DEBUG: Fake loading lots of data
    // for (let i = 0; i < 300; i++) {
    //   this.load.image('sky' + i, 'assets/skies/space3.png')
    // }
  }

  create () {
    // Remove loading text
    this.loadingText.destroy()

    // Add background image
    const startScreen = this.add.image(CONFIG.DEFAULT_WIDTH / 2, CONFIG.DEFAULT_HEIGHT / 2, 'StartScreen')
    startScreen.setScale(
      CONFIG.DEFAULT_WIDTH / startScreen.width,
      CONFIG.DEFAULT_HEIGHT / startScreen.height
    )

    // Add a callback when a key is released
    this.input.keyboard.on('keyup', this.keyReleased, this)

    // Load and play background music
    this.music = this.sound.addAudioSprite('gameAudio')
    this.music.play('freeVertexStudioTrack1')
  }

  keyReleased () {
    console.log('Key released')
    this.scene.start('WorldScene')
    this.music.stop()
  }
}

export default StartScene
