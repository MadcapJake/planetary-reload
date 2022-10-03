// Bring in the phaser library
import Phaser from 'phaser'

import CONFIG from './config.js'

import StartScene from './scenes/Start.js'
import WorldScene from './scenes/World.js'
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
    default: 'matter',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: __DEV__
    },
    matter: {
      gravity: { x: 0, y: 0 },
      debug: __DEV__
    }
  },

}

const game = new Phaser.Game(config);
game.scene.add('StartScene', StartScene);
game.scene.add('WorldScene', WorldScene);
game.scene.add('HUDScene', HUDScene);
game.scene.start('StartScene');
