import Phaser from 'phaser'

import CONFIG from '../config.js'

class HUDScene extends Phaser.Scene {
  create () {
    const {height: h, width: w} = this.scene.get('WorldScene').cameras.main;
    const loadTextOptions = { font: '16pt Arial', color: '#FF0000', align: 'center' };

    this.loadingText = this.add.text(100, 10, 'INFORMATION', loadTextOptions);
    this.loadingText.setOrigin(1, 1).setScrollFactor(0)

    this.hp1 = this.add.image(w-50, h, 'heart.png').setScrollFactor(0);
    this.hp2 = this.add.image(w-100, h, 'heart.png').setScrollFactor(0);
    this.hp3 = this.add.image(w-150, h, 'heart.png').setScrollFactor(0);

    this.hp1.setOrigin(1, 1).setDisplaySize(50, 50);
    this.hp2.setOrigin(1, 1).setDisplaySize(50, 50);
    this.hp3.setOrigin(1, 1).setDisplaySize(50, 50);


    this.player = this.scene.get('WorldScene').player;
    this.reticle = this.scene.get('WorldScene').reticle; 

    this.tabmap = this.scene.get('WorldScene').cameras
      .add((w/2)-250, (h/2)-250, 500, 500)
      .setName('tab-map-camera')
      .setZoom(0.05)
      .setBackgroundColor(0x002244)
      .setVisible(false)
      .startFollow(this.player);
    // this.tabmap.roundPixels = true;

    // Open tab-map when tab is pressed
    const keyTab = this.input.keyboard.addKey('tab');
    keyTab.on('down', () => this.tabmap.setVisible(!this.tabmap.visible));
  }

  update () {}

  loseHealth (remainingHealth) {
    console.log(`Remaining health: ${remainingHealth}`);
    switch(remainingHealth) {
      case  2: this.hp3.destroy(); break;
      case  1: this.hp2.destroy(); break;
      default: this.hp1.destroy(); 
    }
    // TODO: Game over!
  }
}

function constrainReticle(reticle) {

}

export default HUDScene
