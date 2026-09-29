import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class BattleScene extends Scene {
  constructor() {
    super('BattleScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const { width, height } = this.scale;

    // Nền đấu trường xám đậm
    this.add.rectangle(0, 0, width, height, 0x18181b).setOrigin(0, 0);

    this.add
      .text(width / 2, height / 2 - 30, '⚔️ ĐẤU TRƯỜNG THỂ CHẾ (BATTLE ARENA)', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '22px',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 15, 'Mô phỏng tranh luận & ra quyết sách theo lượt kiểu Pokemon', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '13px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5);
  }
}
