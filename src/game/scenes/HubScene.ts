import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';
import { isKhu2Unlocked, REQUIRED_BADGES_FOR_KHU_2 } from '../../systems/progress';

interface LandmarkInfo {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  icon: string;
  color: number;
  onClick: () => void;
  isHero?: boolean;
}

export class HubScene extends Scene {
  private clouds: Phaser.GameObjects.Image[] = [];
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private proximityPrompt!: Phaser.GameObjects.Container;
  private proximityText!: Phaser.GameObjects.Text;
  private nearbyLandmark: LandmarkInfo | null = null;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key;
  };
  private virtualDir: string = 'stop';
  private playerSkin: number = 0;
  private walkStepTimer: number = 0;
  private walkStepFrame: boolean = false;
  private lastFacing: 'down' | 'up' | 'left' | 'right' = 'down';

  private landmarks: LandmarkInfo[] = [];

  constructor() {
    super('HubScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const progress = loadProgress();
    this.playerSkin = progress.playerSkin || 0;
    const isKhu2Open = isKhu2Unlocked(progress.badges);

    const { width, height } = this.scale;
    this.landmarks = [];

    // 1. Nền thành phố vẽ tay nguyên bản từ họa sĩ Kenney (918x515)
    this.add
      .image(0, 0, 'city-base')
      .setOrigin(0, 0);

    // ============================================================
    // 2. CÁC ĐỊA DANH / TÒA NHÀ ĐÔ THỊ (LANDMARKS)
    // ============================================================

    // 📚 Thư Viện Tri Thức (Tòa nhà gạch đỏ cổ điển góc Tây Bắc)
    this.createLandmarkNode({
      x: 85,
      y: 85,
      w: 160,
      h: 150,
      label: 'Thư Viện Tri Thức',
      icon: '📚',
      color: 0x10b981, // Emerald Green
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Khu Tri Thức • Thư Viện Bài Học',
          variant: 'default',
        });
      },
    });

    // 🔭 Đài Quan Sát (Tòa nhà đá xám công vụ trung tâm Tây)
    this.createLandmarkNode({
      x: 265,
      y: 90,
      w: 160,
      h: 150,
      label: 'Đài Quan Sát',
      icon: '🔭',
      color: 0x0ea5e9, // Neon Cyan
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Đài Quan Sát • Sơ Đồ Tư Duy',
          variant: 'default',
        });
      },
    });

    // 🎯 Tòa Thử Thách (Cao ốc văn phòng kính hiện đại có biển hiệu cam)
    this.createLandmarkNode({
      x: 440,
      y: 85,
      w: 150,
      h: 150,
      label: 'Tòa Thử Thách',
      icon: '🎯',
      color: 0xf59e0b, // Cosmic Gold
      isHero: true,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'quiz',
          label: 'Tòa Thử Thách • Thung Lũng Quiz',
          variant: 'default',
        });
      },
    });

    // 🗄️ Nhà Lưu Trữ & Chợ Thuật Ngữ (Cửa hàng mặt tiền có mái hiên sọc xanh)
    this.createLandmarkNode({
      x: 630,
      y: 90,
      w: 180,
      h: 150,
      label: 'Chợ Thuật Ngữ',
      icon: '🗄️',
      color: 0x14b8a6, // Teal
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Nhà Lưu Trữ • Tra Cứu Thuật Ngữ',
          variant: 'default',
        });
      },
    });

    // 👤 Tòa Hồ Sơ & Huy Hiệu (Tòa nhà công vụ góc Tây Nam)
    this.createLandmarkNode({
      x: 95,
      y: 410,
      w: 170,
      h: 130,
      label: 'Hồ Sơ & Thành Tích',
      icon: '👤',
      color: 0x6366f1, // Purple
      onClick: () => EventBus.emit('open-modal', { type: 'profile' }),
    });

    // ⚔️ Phố Thể Chế (Khu 1 - Dãy đại lộ trung tâm với xe cộ & trạm dừng)
    this.createLandmarkNode({
      x: 460,
      y: 260,
      w: 360,
      h: 70,
      label: 'Phố Thể Chế (Khu 1)',
      icon: '⚔️',
      color: 0xef4444, // Alert Red
      isHero: true,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'battle',
          label: 'Phố Thể Chế (Khu 1) • Giao Đấu Tình Huống',
          variant: 'battle',
        });
      },
    });

    // 🔒 Khu 2: Phố Lợi Ích (Khu công nghiệp rào kín góc Đông Nam - Nơi Phong bị kẹt)
    if (isKhu2Open) {
      this.createUnlockedDistrict2(width, height);
    } else {
      this.createLockedDistrict2(width, height);
    }

    // ============================================================
    // 3. NHÂN VẬT NGƯỜI CHƠI (SPAWN TẠI CÔNG VIÊN TRUNG TÂM)
    // ============================================================
    this.createPlayer(440, 420, progress.playerName || 'Nhà Cải Cách');

    // ============================================================
    // 4. BONG BÓNG TƯƠNG TÁC
    // ============================================================
    this.createProximityPrompt();

    // ============================================================
    // 5. BANNER HƯỚNG DẪN DƯỚI ĐÁY
    // ============================================================
    this.add
      .text(
        width / 2,
        height - 14,
        '🎮 Dùng [W-A-S-D] / [Mũi Tên] để di chuyển khám phá thành phố, hoặc nhấp thẳng vào các địa danh!',
        {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '11px',
          color: '#fef08a',
          backgroundColor: '#0a0a0fee',
          padding: { x: 12, y: 3 },
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setDepth(25);

    // ============================================================
    // 6. BÀN PHÍM VÀ D-PAD
    // ============================================================
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        ENTER: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
    }

    EventBus.on('virtual-dpad-move', (data: { dir: string }) => {
      this.virtualDir = data.dir;
    });

    EventBus.on('virtual-action', () => {
      if (this.nearbyLandmark) {
        this.nearbyLandmark.onClick();
      }
    });
  }

  private createPlayer(x: number, y: number, name: string) {
    this.player = this.add.container(x, y).setDepth(20);

    this.playerShadow = this.add
      .ellipse(0, 16, 22, 9, 0x000000, 0.45)
      .setOrigin(0.5);

    const initialKey = `char_${this.playerSkin}_down`;
    this.playerSprite = this.add
      .image(0, 0, initialKey)
      .setScale(2.0)
      .setOrigin(0.5);

    const nameBg = this.add
      .rectangle(0, -24, 92, 16, 0x0a0a0f, 0.9)
      .setStrokeStyle(1.5, 0x39ff14, 1);

    const nameText = this.add
      .text(0, -24, `⭐ ${name}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '8px',
        color: '#ffd93d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.player.add([this.playerShadow, this.playerSprite, nameBg, nameText]);
  }

  private createProximityPrompt() {
    this.proximityPrompt = this.add.container(0, 0).setDepth(30).setVisible(false);

    const bg = this.add
      .rectangle(0, 0, 240, 26, 0x0a0a0f, 0.95)
      .setStrokeStyle(2, 0xffd93d, 1)
      .setInteractive({ useHandCursor: true });

    this.proximityText = this.add
      .text(0, 0, 'Bấm [Space] hoặc [Enter] để vào', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '10.5px',
        color: '#e8e8e8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => {
      if (this.nearbyLandmark) {
        this.nearbyLandmark.onClick();
      }
    });

    this.proximityPrompt.add([bg, this.proximityText]);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    const speed = 2.6;
    let dx = 0;
    let dy = 0;
    let facing: 'down' | 'up' | 'left' | 'right' = this.lastFacing;

    if (this.cursors?.left?.isDown || this.wasd?.A?.isDown || this.virtualDir === 'left') {
      dx -= speed;
      facing = 'left';
    } else if (this.cursors?.right?.isDown || this.wasd?.D?.isDown || this.virtualDir === 'right') {
      dx += speed;
      facing = 'right';
    }

    if (this.cursors?.up?.isDown || this.wasd?.W?.isDown || this.virtualDir === 'up') {
      dy -= speed;
      facing = 'up';
    } else if (this.cursors?.down?.isDown || this.wasd?.S?.isDown || this.virtualDir === 'down') {
      dy += speed;
      facing = 'down';
    }

    const isMoving = dx !== 0 || dy !== 0;

    if (isMoving) {
      this.lastFacing = facing;
      this.player.x = Phaser.Math.Clamp(this.player.x + dx, 20, this.scale.width - 20);
      this.player.y = Phaser.Math.Clamp(this.player.y + dy, 30, this.scale.height - 30);

      this.walkStepTimer += delta;
      if (this.walkStepTimer > 150) {
        this.walkStepTimer = 0;
        this.walkStepFrame = !this.walkStepFrame;
      }

      const frameKey = this.walkStepFrame
        ? `char_${this.playerSkin}_walk_${facing}`
        : `char_${this.playerSkin}_${facing}`;
      this.playerSprite.setTexture(frameKey);
    } else {
      this.playerSprite.setTexture(`char_${this.playerSkin}_${this.lastFacing}`);
    }

    // Kiểm tra khoảng cách tới các địa danh
    let closest: LandmarkInfo | null = null;
    let minDist = 80;

    for (const l of this.landmarks) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, l.x, l.y);
      if (dist < minDist) {
        minDist = dist;
        closest = l;
      }
    }

    this.nearbyLandmark = closest;

    if (closest) {
      this.proximityPrompt.setPosition(this.player.x, this.player.y - 45);
      this.proximityText.setText(`[Space / Enter] Vào ${closest.label}`);
      this.proximityPrompt.setVisible(true);

      if (
        Phaser.Input.Keyboard.JustDown(this.wasd?.SPACE) ||
        Phaser.Input.Keyboard.JustDown(this.wasd?.ENTER)
      ) {
        closest.onClick();
      }
    } else {
      this.proximityPrompt.setVisible(false);
    }
  }

  /**
   * Tạo địa danh tương tác:
   * Mặc định là huy hiệu tròn thanh lịch, khi hover sẽ nảy nhẹ và mở rộng tên
   */
  private createLandmarkNode(options: LandmarkInfo) {
    this.landmarks.push(options);
    const { x, y, w, h, label, icon, color, onClick, isHero } = options;

    const container = this.add.container(x, y);

    const hitZone = this.add
      .rectangle(0, 0, w, h, color, 0.001)
      .setInteractive({ useHandCursor: true });

    const highlightBox = this.add
      .rectangle(0, 0, w + 4, h + 4, color, 0.12)
      .setStrokeStyle(1.5, 0x00fff5, 0)
      .setVisible(false);

    const badgeW = isHero ? 130 : 28;
    const badgeH = 24;
    const badgeY = -h / 2 + 10;

    const badgeBg = this.add
      .rectangle(0, badgeY, badgeW, badgeH, 0x0a0a0f, 0.92)
      .setStrokeStyle(1.5, color, 1);

    const badgeText = this.add
      .text(0, badgeY, isHero ? `${icon} ${label}` : icon, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: isHero ? '10px' : '12px',
        color: '#e8e8e8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([hitZone, highlightBox, badgeBg, badgeText]);

    hitZone.on('pointerover', () => {
      highlightBox.setVisible(true);
      highlightBox.setStrokeStyle(1.5, 0x00fff5, 0.9);

      if (!isHero) {
        const fullW = Math.max(90, label.length * 7.2 + 28);
        badgeBg.setSize(fullW, badgeH);
        badgeText.setText(`${icon} ${label}`);
        badgeText.setFontSize('9px');
      }

      this.tweens.add({
        targets: container,
        scale: 1.03,
        y: y - 3,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    });

    hitZone.on('pointerout', () => {
      highlightBox.setVisible(false);

      if (!isHero) {
        badgeBg.setSize(badgeW, badgeH);
        badgeText.setText(icon);
        badgeText.setFontSize('12px');
      }

      this.tweens.add({
        targets: container,
        scale: 1.0,
        y: y,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    });

    hitZone.on('pointerdown', onClick);

    return container;
  }

  private createUnlockedDistrict2(width: number, height: number) {
    this.createLandmarkNode({
      x: 780,
      y: 420,
      w: 220,
      h: 150,
      label: 'Phố Lợi Ích (Cứu Phong)',
      icon: '🌟',
      color: 0x6c5ce7,
      isHero: true,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'battle-khu2',
          label: 'Phố Lợi Ích (Khu 2) • Giải Cứu Phong',
          variant: 'battle',
        });
      },
    });

    this.add
      .text(780, 320, '✨ MÂY ĐÃ TAN • ĐÃ MỞ KHU 2! ✨', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '10px',
        color: '#ffd93d',
        backgroundColor: '#1a1a2e',
        padding: { x: 8, y: 3 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private createLockedDistrict2(width: number, height: number) {
    const k2_x = 650;
    const k2_w = width - k2_x;
    const k2_y = 280;
    const k2_h = height - k2_y;

    // Sương mù mờ trên khu công nghiệp
    this.add
      .rectangle(k2_x, k2_y, k2_w, k2_h, 0x0a0a0f, 0.55)
      .setOrigin(0, 0);

    const cloudPositions = [
      { x: k2_x + 50, y: k2_y + 40, key: 'cloud_large', dur: 3400, dist: 20 },
      { x: k2_x + 160, y: k2_y + 80, key: 'cloud_medium', dur: 2800, dist: 15 },
      { x: k2_x + 90, y: k2_y + 140, key: 'cloud_large', dur: 3800, dist: 25 },
      { x: k2_x + 200, y: k2_y + 160, key: 'cloud_small', dur: 2400, dist: 12 },
    ];

    for (const cp of cloudPositions) {
      const c = this.add
        .image(cp.x, cp.y, cp.key)
        .setScale(1.5)
        .setAlpha(0.9);
      this.clouds.push(c);

      this.tweens.add({
        targets: c,
        x: `+=${cp.dist}`,
        y: '+=6',
        yoyo: true,
        repeat: -1,
        duration: cp.dur,
        ease: 'Sine.easeInOut',
      });
    }

    // Bảng khóa chốt chặn
    const bannerContainer = this.add
      .container(k2_x + k2_w / 2, k2_y + k2_h / 2)
      .setSize(220, 80)
      .setInteractive({ useHandCursor: true });

    const bannerBg = this.add
      .rectangle(0, 0, 220, 80, 0x0a0a0f, 0.94)
      .setStrokeStyle(2, 0xffd93d, 1);

    const lockTitle = this.add
      .text(0, -22, '🔒 KHU 2: PHỐ LỢI ÍCH', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '12px',
        color: '#ffd93d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const lockCond = this.add
      .text(0, 0, `Cần ${REQUIRED_BADGES_FOR_KHU_2} Huy hiệu Thể chế Khu 1`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '9.5px',
        color: '#e8e8e8',
      })
      .setOrigin(0.5);

    const lockGoal = this.add
      .text(0, 20, 'Nơi Phong bị kẹt • Chốt chặn đóng', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '9px',
        color: '#ff4757',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bannerContainer.add([bannerBg, lockTitle, lockCond, lockGoal]);

    bannerContainer.on('pointerdown', () => {
      this.tweens.add({
        targets: bannerContainer,
        x: bannerContainer.x + 6,
        yoyo: true,
        repeat: 3,
        duration: 50,
      });

      EventBus.emit('locked-zone-clicked', {
        zone: 'khu-2',
        message: `Khu 2 đang bị chốt chặn! Cần đạt đủ ${REQUIRED_BADGES_FOR_KHU_2} Huy hiệu Thể chế Khu 1 để giải cứu Phong!`,
      });
    });
  }
}
