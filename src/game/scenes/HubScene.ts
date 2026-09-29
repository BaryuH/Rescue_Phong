import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class HubScene extends Scene {
  constructor() {
    super('HubScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);

    const { width, height } = this.scale;

    // Nền bản đồ thành phố
    this.add.rectangle(0, 0, width, height, 0x1e293b).setOrigin(0, 0);

    // Header thông tin
    this.add
      .text(width / 2, 40, 'BẢN ĐỒ THÀNH PHỐ RESCUE PHONG', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '22px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 75, 'Chọn một khu vực để bắt đầu học tập và giải cứu Phong', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '13px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

    // Tạo các khu vực tương tác trên bản đồ
    this.createInteractiveZone(
      width * 0.25,
      height * 0.35,
      180,
      120,
      'KHU TRI THỨC',
      'Thư viện, Sơ đồ tư duy & Thuật ngữ',
      0x059669,
      () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Khu Tri Thức',
          variant: 'default',
        });
      }
    );

    this.createInteractiveZone(
      width * 0.72,
      height * 0.35,
      180,
      120,
      'TÒA THỬ THÁCH',
      '10 Màn Quiz Angry Birds tích sao',
      0xd97706,
      () => {
        EventBus.emit('request-transition', {
          target: 'quiz',
          label: 'Tòa Thử Thách (Quiz Hub)',
          variant: 'default',
        });
      }
    );

    this.createInteractiveZone(
      width * 0.25,
      height * 0.7,
      200,
      130,
      'KHU KINH DOANH 1',
      'Phố Thể Chế (RPG Battle vs NPC)',
      0xdc2626,
      () => {
        EventBus.emit('request-transition', {
          target: 'battle',
          label: 'Đấu Trường Thể Chế (Khu 1)',
          variant: 'battle',
        });
      }
    );

    this.createInteractiveZone(
      width * 0.72,
      height * 0.7,
      200,
      130,
      'KHU KINH DOANH 2',
      'Phố Lợi Ích (Đang khóa - Cần 3 Huy hiệu)',
      0x475569,
      () => {
        EventBus.emit('locked-zone-clicked', {
          zone: 'khu-2',
          message: 'Cần đạt 3 Huy hiệu Thể chế để mở cổng giải cứu Phong!',
        });
      },
      true
    );
  }

  private createInteractiveZone(
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    desc: string,
    color: number,
    onClick: () => void,
    isLocked: boolean = false
  ) {
    const container = this.add.container(x, y);

    // Hộp nền
    const bg = this.add
      .rectangle(0, 0, w, h, color, isLocked ? 0.4 : 0.85)
      .setStrokeStyle(3, isLocked ? 0x64748b : 0xffffff, 0.9)
      .setInteractive({ useHandCursor: !isLocked });

    // Tiêu đề
    const tText = this.add
      .text(0, -20, title, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Mô tả
    const dText = this.add
      .text(0, 15, desc, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '11px',
        color: isLocked ? '#94a3b8' : '#e2e8f0',
        align: 'center',
        wordWrap: { width: w - 20 },
      })
      .setOrigin(0.5);

    if (isLocked) {
      const lockBadge = this.add
        .text(0, -h / 2, ' 🔒 ĐANG KHÓA ', {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '10px',
          color: '#fde047',
          backgroundColor: '#0f172a',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      container.add([bg, tText, dText, lockBadge]);
    } else {
      bg.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scale: 1.05,
          duration: 120,
        });
      });

      bg.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scale: 1.0,
          duration: 120,
        });
      });

      bg.on('pointerdown', onClick);
      container.add([bg, tText, dText]);
    }

    return container;
  }
}
