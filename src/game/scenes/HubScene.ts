import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';
import { isKhu2Unlocked, REQUIRED_BADGES_FOR_KHU_2 } from '../../systems/progress';

interface BuildingInfo {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sublabel: string;
  color: number;
  badgeIcon: string;
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
  private nearbyBuilding: BuildingInfo | null = null;

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

  private buildings: BuildingInfo[] = [];

  constructor() {
    super('HubScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const progress = loadProgress();
    this.playerSkin = progress.playerSkin || 0;
    const isKhu2Open = isKhu2Unlocked(progress.badges);

    const { width, height } = this.scale;
    this.buildings = [];

    // 1. Lớp nền thành phố từ tile Kenney Modern City
    this.add
      .image(0, 0, 'city-base')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // 2. KHU TRI THỨC (Góc Tây Bắc)
    this.addBuilding({
      x: width * 0.12,
      y: height * 0.14,
      w: 110,
      h: 70,
      label: 'Thư Viện Tri Thức',
      sublabel: '33 Thẻ Bài Học',
      color: 0x059669,
      badgeIcon: '📚',
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Khu Tri Thức • Thư Viện Bài Học',
          variant: 'default',
        });
      },
    });

    this.addBuilding({
      x: width * 0.26,
      y: height * 0.14,
      w: 90,
      h: 70,
      label: 'Đài Quan Sát',
      sublabel: 'Sơ Đồ Tư Duy',
      color: 0x0284c7,
      badgeIcon: '🔭',
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Đài Quan Sát • Sơ Đồ Tư Duy',
          variant: 'default',
        });
      },
    });

    this.addBuilding({
      x: width * 0.15,
      y: height * 0.32,
      w: 120,
      h: 70,
      label: 'Nhà Lưu Trữ',
      sublabel: '83 Thuật Ngữ Pokédex',
      color: 0x0d9488,
      badgeIcon: '🗄️',
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Nhà Lưu Trữ • Tra Cứu Thuật Ngữ',
          variant: 'default',
        });
      },
    });

    // 3. TÒA THỬ THÁCH (Trung tâm - Quiz Hub)
    this.addBuilding({
      x: width * 0.54,
      y: height * 0.22,
      w: 160,
      h: 120,
      label: 'TÒA THỬ THÁCH',
      sublabel: 'Angry Birds Quiz (20 Màn)',
      color: 0xd97706,
      badgeIcon: '🎯',
      isHero: true,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'quiz',
          label: 'Tòa Thử Thách • Thung Lũng Quiz',
          variant: 'default',
        });
      },
    });

    // 4. QUẢNG TRƯỜNG & TOÀ NHÀ PHỤ (Tây Nam)
    this.addBuilding({
      x: width * 0.1,
      y: height * 0.63,
      w: 75,
      h: 55,
      label: 'Hồ Sơ',
      sublabel: 'Nhân vật & Skin',
      color: 0x6366f1,
      badgeIcon: '👤',
      onClick: () => EventBus.emit('open-modal', { type: 'profile' }),
    });

    this.addBuilding({
      x: width * 0.18,
      y: height * 0.63,
      w: 75,
      h: 55,
      label: 'Huy Hiệu',
      sublabel: 'Thành tích',
      color: 0xeab308,
      badgeIcon: '🏆',
      onClick: () => EventBus.emit('open-modal', { type: 'badges' }),
    });

    this.addBuilding({
      x: width * 0.26,
      y: height * 0.63,
      w: 75,
      h: 55,
      label: 'Xếp Hạng',
      sublabel: 'Điểm số',
      color: 0x8b5cf6,
      badgeIcon: '📊',
      onClick: () => EventBus.emit('open-modal', { type: 'leaderboard' }),
    });

    this.addBuilding({
      x: width * 0.1,
      y: height * 0.76,
      w: 85,
      h: 55,
      label: 'Cài Đặt',
      sublabel: 'Âm thanh & Phím',
      color: 0x64748b,
      badgeIcon: '⚙️',
      onClick: () => EventBus.emit('open-modal', { type: 'settings' }),
    });

    // 5. KHU KINH DOANH 1: PHỐ THỂ CHẾ (Dải phía Nam)
    this.addBuilding({
      x: width * 0.33,
      y: height * 0.9,
      w: 320,
      h: 75,
      label: 'PHỐ THỂ CHẾ (KHU 1)',
      sublabel: 'Đấu trường RPG • 6 Tình huống Thể chế',
      color: 0xdc2626,
      badgeIcon: '⚔️',
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'battle',
          label: 'Phố Thể Chế (Khu 1) • Giao Đấu Tình Huống',
          variant: 'battle',
        });
      },
    });

    // 6. KHU KINH DOANH 2: PHỐ LỢI ÍCH
    if (isKhu2Open) {
      this.createUnlockedDistrict2(width, height);
    } else {
      this.createLockedDistrict2(width, height);
    }

    // 7. NHÂN VẬT NGƯỜI CHƠI (TẠI QUẢNG TRƯỜNG TRUNG TÂM)
    this.createPlayer(width * 0.21, height * 0.72, progress.playerName || 'Nhà Cải Cách');

    // 8. BONG BÓNG NHẮC NHỞ TƯƠNG TÁC CỬA TÒA NHÀ
    this.createProximityPrompt();

    // 9. BANNER HƯỚNG DẪN ĐIỀU KHIỂN
    this.add
      .text(
        width / 2,
        height - 18,
        '🎮 Dùng phím [W-A-S-D] hoặc [Mũi Tên] để điều khiển nhân vật đi lại khám phá thành phố, hoặc nhấp thẳng vào các tòa nhà!',
        {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '11px',
          color: '#fef08a',
          backgroundColor: '#020617ee',
          padding: { x: 12, y: 4 },
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setDepth(25);

    // 10. LẮNG NGHE BÀN PHÍM VÀ D-PAD
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
      if (this.nearbyBuilding) {
        this.nearbyBuilding.onClick();
      }
    });
  }

  /**
   * Tạo nhân vật người chơi với sprite pixel từ Kenney RPG Urban
   */
  private createPlayer(x: number, y: number, name: string) {
    this.player = this.add.container(x, y).setDepth(20);

    // Bóng nhân vật
    this.playerShadow = this.add
      .ellipse(0, 16, 26, 12, 0x000000, 0.4)
      .setOrigin(0.5);

    // Sprite nhân vật pixel 16x16 phóng to 2.2x
    const initialKey = `char_${this.playerSkin}_down`;
    this.playerSprite = this.add
      .image(0, 0, initialKey)
      .setScale(2.2)
      .setOrigin(0.5);

    // Nhãn tên người chơi
    const nameBg = this.add
      .rectangle(0, -26, 110, 18, 0x020617, 0.85)
      .setStrokeStyle(1.5, 0x22c55e, 1);

    const nameText = this.add
      .text(0, -26, `⭐ ${name}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '9px',
        color: '#fef08a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.player.add([this.playerShadow, this.playerSprite, nameBg, nameText]);
  }

  /**
   * Tạo hộp thông báo khi đứng gần cửa tòa nhà
   */
  private createProximityPrompt() {
    this.proximityPrompt = this.add.container(0, 0).setDepth(30).setVisible(false);

    const bg = this.add
      .rectangle(0, 0, 240, 28, 0x020617, 0.95)
      .setStrokeStyle(2, 0xf59e0b, 1)
      .setInteractive({ useHandCursor: true });

    this.proximityText = this.add
      .text(0, 0, 'Bấm [Space] hoặc [Enter] để vào', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => {
      if (this.nearbyBuilding) {
        this.nearbyBuilding.onClick();
      }
    });

    this.proximityPrompt.add([bg, this.proximityText]);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    const speed = 2.8;
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
      this.player.x = Phaser.Math.Clamp(this.player.x + dx, 25, this.scale.width - 25);
      this.player.y = Phaser.Math.Clamp(this.player.y + dy, 35, this.scale.height - 35);

      // Animation bước chân
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

    // Kiểm tra khoảng cách tới các tòa nhà để hiện prompt tương tác
    let closestBuilding: BuildingInfo | null = null;
    let minDist = 75;

    for (const b of this.buildings) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      if (dist < minDist) {
        minDist = dist;
        closestBuilding = b;
      }
    }

    this.nearbyBuilding = closestBuilding;

    if (closestBuilding) {
      this.proximityPrompt.setPosition(this.player.x, this.player.y - 50);
      this.proximityText.setText(`[Space / Enter] Vào ${closestBuilding.label}`);
      this.proximityPrompt.setVisible(true);

      // Bấm Space hoặc Enter để vào tòa nhà
      if (
        Phaser.Input.Keyboard.JustDown(this.wasd?.SPACE) ||
        Phaser.Input.Keyboard.JustDown(this.wasd?.ENTER)
      ) {
        closestBuilding.onClick();
      }
    } else {
      this.proximityPrompt.setVisible(false);
    }
  }

  private addBuilding(options: BuildingInfo) {
    this.buildings.push(options);
    this.createBuildingNode(options);
  }

  private createBuildingNode(options: BuildingInfo) {
    const { x, y, w, h, label, sublabel, color, badgeIcon, onClick, isHero } = options;

    const container = this.add.container(x, y);

    const hitZone = this.add
      .rectangle(0, 0, w, h, color, 0.001)
      .setInteractive({ useHandCursor: true });

    const highlightBox = this.add
      .rectangle(0, 0, w + 8, h + 8, color, 0.15)
      .setStrokeStyle(2, 0xffffff, 0)
      .setVisible(false);

    const labelBox = this.add
      .rectangle(0, -h / 2 - 12, isHero ? 160 : 125, 24, 0x0f172a, 0.9)
      .setStrokeStyle(1.5, color, 0.95);

    const labelText = this.add
      .text(0, -h / 2 - 12, `${badgeIcon} ${label}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: isHero ? '12px' : '10px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([hitZone, highlightBox, labelBox, labelText]);

    hitZone.on('pointerover', () => {
      highlightBox.setVisible(true);
      highlightBox.setStrokeStyle(2, 0xffffff, 0.9);

      this.tweens.add({
        targets: container,
        scale: isHero ? 1.05 : 1.08,
        y: y - 5,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    });

    hitZone.on('pointerout', () => {
      highlightBox.setVisible(false);

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
    const k2_x = width * 0.65;
    const k2_w = width * 0.35;

    this.addBuilding({
      x: k2_x + k2_w / 2,
      y: height * 0.45,
      w: 240,
      h: 110,
      label: 'PHỐ LỢI ÍCH (KHU 2)',
      sublabel: '🌟 ĐÃ MỞ KHÓA • GIẢI CỨU PHONG!',
      color: 0x9333ea,
      badgeIcon: '🌟',
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
      .text(k2_x + k2_w / 2, height * 0.15, '✨ MÂY ĐÃ TAN • ĐƯỜNG CỨU PHONG ĐÃ MỞ! ✨', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '11px',
        color: '#fef08a',
        backgroundColor: '#581c87',
        padding: { x: 8, y: 4 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private createLockedDistrict2(width: number, height: number) {
    const k2_x = width * 0.65;
    const k2_w = width * 0.35;

    this.add
      .rectangle(k2_x, 0, k2_w, height, 0x0f172a, 0.55)
      .setOrigin(0, 0);

    const cloudPositions = [
      { x: k2_x + 50, y: 100, key: 'cloud_large', dur: 3400, dist: 25 },
      { x: k2_x + 180, y: 160, key: 'cloud_medium', dur: 2800, dist: 20 },
      { x: k2_x + 90, y: 260, key: 'cloud_large', dur: 3800, dist: 30 },
      { x: k2_x + 220, y: 340, key: 'cloud_small', dur: 2400, dist: 15 },
      { x: k2_x + 70, y: 440, key: 'cloud_medium', dur: 3000, dist: 22 },
      { x: k2_x + 190, y: 520, key: 'cloud_large', dur: 3600, dist: 28 },
    ];

    for (const cp of cloudPositions) {
      const c = this.add
        .image(cp.x, cp.y, cp.key)
        .setScale(1.8)
        .setAlpha(0.9);
      this.clouds.push(c);

      this.tweens.add({
        targets: c,
        x: `+=${cp.dist}`,
        y: '+=8',
        yoyo: true,
        repeat: -1,
        duration: cp.dur,
        ease: 'Sine.easeInOut',
      });
    }

    const bannerContainer = this.add
      .container(k2_x + k2_w / 2, height * 0.45)
      .setSize(260, 110)
      .setInteractive({ useHandCursor: true });

    const bannerBg = this.add
      .rectangle(0, 0, 260, 110, 0x020617, 0.92)
      .setStrokeStyle(3, 0xf59e0b, 1);

    const lockTitle = this.add
      .text(0, -30, '🔒 KHU 2: PHỐ LỢI ÍCH', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '14px',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const lockCond = this.add
      .text(0, -3, `Điều kiện: Cần ${REQUIRED_BADGES_FOR_KHU_2} Huy hiệu Thể chế`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '11px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    const lockGoal = this.add
      .text(0, 22, 'Mục tiêu: Giải cứu Phong tại đây!', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '11px',
        color: '#f87171',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bannerContainer.add([bannerBg, lockTitle, lockCond, lockGoal]);

    bannerContainer.on('pointerdown', () => {
      this.tweens.add({
        targets: bannerContainer,
        x: bannerContainer.x + 8,
        yoyo: true,
        repeat: 3,
        duration: 50,
      });

      EventBus.emit('locked-zone-clicked', {
        zone: 'khu-2',
        message: `Khu 2 (Phố Lợi Ích) đang bị khóa! Bạn cần đạt ${REQUIRED_BADGES_FOR_KHU_2} Huy hiệu Thể chế để mở cổng giải cứu Phong!`,
      });
    });
  }
}
