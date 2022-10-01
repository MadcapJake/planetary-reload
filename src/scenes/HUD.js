import Phaser from 'phaser'

import CONFIG from '../config.js'

class HUDScene extends Phaser.Scene {
  create () {
    const {DEFAULT_WIDTH: w, DEFAULT_HEIGHT: h} = CONFIG;

    this.loadingText = this.add.text(w - 10, h - 10, 'INFORMATION', { font: '16pt Arial', color: '#FF0000', align: 'center' }
    )
    this.loadingText.setOrigin(1, 1)
    

    this.hp1     = this.add.image(-350, -250, 'heart').setScrollFactor(0.5, 0.5);
    this.hp2     = this.add.image(-300, -250, 'heart').setScrollFactor(0.5, 0.5);
    this.hp3     = this.add.image(-250, -250, 'heart').setScrollFactor(0.5, 0.5);

    this.hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    this.hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    this.hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

    this.player = this.scene.get('FollowScene').player;
    this.reticle = this.scene.get('FollowScene').reticle; 

  }

  update () {
    const {DEFAULT_WIDTH: w, DEFAULT_HEIGHT: h} = CONFIG;
    const distX = this.reticle.x - this.player.x,
          distY = this.reticle.y - this.player.y;
  
    // ensure reticle cannot be moved offscreen
    if (distX > w)       this.reticle.x = this.player.x + w;
    else if (distX < -w) this.reticle.x = this.player.x - w;
  
    if (distY > h)       this.reticle.y = this.player.y + h;
    else if (distY < -h) this.reticle.y = this.player.y - h;
  }

  loseHealth (remainingHealth) {
    switch(remainingHealth) {
      case  2: this.hp3.destroy(); break;
      case  1: this.hp2.destroy(); break;
      default: this.hp1.destroy(); 
    }
  }
}

function constrainReticle(reticle) {

}

export default HUDScene
