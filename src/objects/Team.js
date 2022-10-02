import Phaser from 'phaser'

import CONFIG from '../config.js'

class Team extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);
  }
  update() {
    // TODO: ensure all regions have a guard
    // TODO: send out an attack force per bunker
  }
}

export default Team;