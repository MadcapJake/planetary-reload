import Phaser from 'phaser'

import CONFIG from '../config.js'

class Laser extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, 0, 0, 'laser');
    this.speed = 1;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.setDisplaySize(12, 12);
  }

  fire(shooter, target) {
    this.setPosition(shooter.x, shooter.y); // init position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

    // Calculate x & y velocity of laser to move from shooter to target
    if (target.y >= this.y) {
      this.xSpeed =  this.speed * Math.sin(this.direction);
      this.ySpeed =  this.speed * Math.cos(this.direction);
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction);
      this.ySpeed = -this.speed * Math.cos(this.direction);
    }

    this.rotation = shooter.rotation; // angle laser with shooters rotation
    
    this.born = 0; // time since new laser spawned
  }

  update(time, delta) {
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;
    this.born += delta;
    if (this.born > 1800) { this.setActive(false); this.setVisible(false) }
  }
}

export default Laser