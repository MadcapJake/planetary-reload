import Phaser from 'phaser'

import CONFIG from '../config.js'

const debugPosTmpl = (go) => `
X: ${go.body.velocity.x >= 0 ? '+' : ''}${go.body.velocity.x.toFixed(8)}
Y: ${go.body.velocity.y >= 0 ? '+' : ''}${go.body.velocity.y.toFixed(8)}
`.trim();

class HUDScene extends Phaser.Scene {
  create () {
    const {height: h, width: w} = this.scene.get('WorldScene').cameras.main;
    const debugTextOptions = { font: '16pt Consolas', color: '#FF0000', align: 'left' };

    this.player = this.scene.get('WorldScene').player;
    this.reticle = this.scene.get('WorldScene').reticle; 

    this.debugText = this.add.text(100, 10, debugPosTmpl(this.player), debugTextOptions);
    this.debugText.setOrigin(0, 0).setScrollFactor(0)

    this.hp1 = this.add.image(w-50, h, 'heart.png').setScrollFactor(0);
    this.hp2 = this.add.image(w-100, h, 'heart.png').setScrollFactor(0);
    this.hp3 = this.add.image(w-150, h, 'heart.png').setScrollFactor(0);

    this.hp1.setOrigin(1, 1).setDisplaySize(50, 50);
    this.hp2.setOrigin(1, 1).setDisplaySize(50, 50);
    this.hp3.setOrigin(1, 1).setDisplaySize(50, 50);

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

  update () {
    this.debugText.setText(debugPosTmpl(this.player));
  }

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
