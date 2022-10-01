// Bring in the phaser library
import Phaser from 'phaser'

import CONFIG from './config.js'

import StartScene from './scenes/Start.js'
import FollowScene from './scenes/Follow.js'
import HUDScene from './scenes/HUD.js'

const config = {
  // Configure Phaser graphics settings
  type: Phaser.AUTO,
  scale: {
    parent: 'game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    width: CONFIG.DEFAULT_WIDTH,
    height: CONFIG.DEFAULT_HEIGHT
  },

  // Configure physics settings
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: CONFIG.DEFAULT_GRAVITY },
      debug: __DEV__
    }
  },

}

// Initialize the base phaser game object (must always be done once)
const game = new Phaser.Game(config)

// Add and auto-starting ExampleScene
game.scene.add('StartScene', StartScene)
game.scene.add('FollowScene', FollowScene)
game.scene.add('HUDScene', HUDScene)
game.scene.start('StartScene')
