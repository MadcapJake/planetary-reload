import Phaser from "phaser";

import CONFIG from "../config";

export default class CanopiesManager {
  constructor(scene, canopyLayer) {
    this.tweens = scene.tweens;
    this.timer = scene.time;
    this.enabled = false;
    this.timeEnabled = 0;
    this.bodies = []
    this.obfuscatingBodies = [];
  }
  enable(gameObject) {
    this.enabled = true;
    if (gameObject.alpha > 0.5) {
      this.tweens.add({
        targets: gameObject,
        alpha: { value: 0.5, duration: 500 }
      });
      // gameObject.setAlpha(0.5);
    }
    if (gameObject in this.obfuscatingBodies) return;
    this.timeEnabled = this.timer.now;
    this.obfuscatingBodies.push(gameObject);
  }
  reset() {
    this.enabled = false;
    this.timeEnabled = 0;
    // for (let body of this.obfuscatingBodies)
    this.tweens.add({targets: this.obfuscatingBodies, alpha: { value: 1, duration: 1000 }});
    this.obfuscatingBodies = [];
  }
  delayPassed() {
    return this.timeEnabled < this.timer.now - 250
  }
  add(body) {
    this.bodies.push(body);
  }
}