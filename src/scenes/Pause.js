import Phaser from 'phaser';
import { W, H } from '../config.js';
import { Save } from '../systems/SaveSystem.js';
import { button, text } from '../ui/widgets.js';

export default class Pause extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setInteractive();
    text(this, W / 2, 200, 'PAUSED', 36, '#ffffff');
    button(this, W / 2, 300, 220, 52, 'RESUME', () => {
      this.scene.stop();
      this.scene.resume('Game');
    }, { size: 20 });
    const sound = button(this, W / 2, 370, 220, 42, '', () => {
      Save.data.settings.sound = !Save.data.settings.sound;
      Save.save();
      sound.setLabel(`SOUND ${Save.data.settings.sound ? 'ON' : 'OFF'}`);
    }, { color: 0x444466 });
    sound.setLabel(`SOUND ${Save.data.settings.sound ? 'ON' : 'OFF'}`);
    button(this, W / 2, 430, 220, 42, 'QUIT RUN', () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    }, { color: 0x663333 });
    text(this, W / 2, 480, 'Quitting loses this run\'s coins', 10, '#a08090');
  }
}
