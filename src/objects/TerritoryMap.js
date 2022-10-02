import Phaser from 'phaser'

import CONFIG from '../config.js'

class TerritoryMap extends Phaser.GameObjects.Tilemap {
  constructor() {
    this.tileWidth = 32;
    this.tileHeight = 32;
    this.width = 100;
    this.height = 100;
    this.controlLayer = this.createLayer('faction-control', )
  }
}