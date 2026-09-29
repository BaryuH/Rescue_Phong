import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class OverworldScene extends Scene {
  constructor() {
    super('OverworldScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0, 0);

    this.add
      .text(width / 2, height / 2 - 20, 'PHỐ THỂ CHẾ (OVERWORLD KHU 1)', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '20px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, 'Đang chuẩn bị nạp map Tiled và các NPC...', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '14px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);
  }
}
