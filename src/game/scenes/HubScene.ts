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

    // 1. Lớp nền thành phố đã bổ sung rào sắt bao quanh từng mảnh đất
    this.add
      .image(0, 0, 'city-base')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // ==========================================
    // 2. MẢNH ĐẤT 1: KHU TRI THỨC (Góc Tây Bắc)
    // ==========================================
    // Thư Viện (Tây Bắc) - x: 95, y: 105
    this.addBuilding({
      x: 95,
      y: 105,
      w: 100,
      h: 65,
      label: 'Thư Viện Tri Thức',
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

    // Đài Quan Sát (Đông Bắc) - x: 270, y: 105 (Cách Thư Viện 175px -> RẤT THOÁNG)
    this.addBuilding({
      x: 270,
      y: 105,
      w: 95,
      h: 65,
      label: 'Đài Quan Sát',
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

    // Nhà Lưu Trữ (Trung tâm phía Nam Khu Tri Thức) - x: 175, y: 195
    this.addBuilding({
      x: 175,
      y: 195,
      w: 120,
      h: 65,
      label: 'Nhà Lưu Trữ',
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

    // ==========================================
    // 3. MẢNH ĐẤT 2: TÒA THỬ THÁCH (North-Center)
    // ==========================================
    this.addBuilding({
      x: 565,
      y: 110,
      w: 150,
      h: 115,
      label: 'TÒA THỬ THÁCH',
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

    // ==========================================
    // 4. MẢNH ĐẤT 3: QUẢNG TRƯỜNG & TOÀ NHÀ PHỤ
    // 4 Tòa nhà phân bố 4 góc độc lập quanh đài phun nước
    // ==========================================
    // Hồ Sơ (Tây Bắc quảng trường)
    this.addBuilding({
      x: 85,
      y: 375,
      w: 75,
      h: 48,
      label: 'Hồ Sơ',
      color: 0x6366f1,
      badgeIcon: '👤',
      onClick: () => EventBus.emit('open-modal', { type: 'profile' }),
    });

    // Huy Hiệu (Đông Bắc quảng trường - Cách Hồ Sơ 190px -> KHÔNG CHỒNG LẤN)
    this.addBuilding({
      x: 275,
      y: 375,
      w: 75,
      h: 48,
      label: 'Huy Hiệu',
      color: 0xeab308,
      badgeIcon: '🏆',
      onClick: () => EventBus.emit('open-modal', { type: 'badges' }),
    });

    // Xếp Hạng (Tây Nam quảng trường - Cách Hồ Sơ 100px chiều dọc)
    this.addBuilding({
      x: 85,
      y: 475,
      w: 75,
      h: 48,
      label: 'Xếp Hạng',
      color: 0x8b5cf6,
      badgeIcon: '📊',
      onClick: () => EventBus.emit('open-modal', { type: 'leaderboard' }),
    });

    // Cài Đặt (Đông Nam quảng trường - Cách Huy Hiệu 100px chiều dọc)
    this.addBuilding({
      x: 275,
      y: 475,
      w: 75,
      h: 48,
      label: 'Cài Đặt',
      color: 0x64748b,
      badgeIcon: '⚙️',
      onClick: () => EventBus.emit('open-modal', { type: 'settings' }),
    });

    // ==========================================
    // 5. MẢNH ĐẤT 4: PHỐ THỂ CHẾ (KHU 1 - South Street)
    // ==========================================
    this.addBuilding({
      x: 330,
      y: 605,
      w: 230,
      h: 45,
      label: 'PHỐ THỂ CHẾ (KHU 1)',
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

    // ==========================================
    // 6. MẢNH ĐẤT 5: KHU 2: PHỐ LỢI ÍCH (East)
    // ==========================================
    if (isKhu2Open) {
      this.createUnlockedDistrict2(width, height);
    } else {
      this.createLockedDistrict2(width, height);
    }

    // ==========================================
    // 7. NHÂN VẬT NGƯỜI CHƠI (TẠI QUẢNG TRƯỜNG TRUNG TÂM GIỮA ĐÀI PHUN NƯỚC)
    // ==========================================
    this.createPlayer(180, 425, progress.playerName || 'Nhà Cải Cách');

    // ==========================================
    // 8. BONG BÓNG TƯƠNG TÁC
    // ==========================================
    this.createProximityPrompt();

    // ==========================================
    // 9. BANNER HƯỚNG DẪN ĐIỀU KHIỂN
    // ==========================================
    this.add
      .text(
        width / 2,
        height - 14,
        '🎮 Dùng [W-A-S-D] hoặc [Mũi Tên] để điều khiển nhân vật đi lại khám phá thành phố, hoặc nhấp thẳng vào các tòa nhà!',
        {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '11px',
          color: '#fef08a',
          backgroundColor: '#020617f0',
          padding: { x: 14, y: 3 },
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setDepth(25);

    // ==========================================
    // 10. BÀN PHÍM VÀ D-PAD
    // ==========================================
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

  private createPlayer(x: number, y: number, name: string) {
    this.player = this.add.container(x, y).setDepth(20);

    this.playerShadow = this.add
      .ellipse(0, 16, 24, 10, 0x000000, 0.4)
      .setOrigin(0.5);

    const initialKey = `char_${this.playerSkin}_down`;
    this.playerSprite = this.add
      .image(0, 0, initialKey)
      .setScale(2.2)
      .setOrigin(0.5);

    const nameBg = this.add
      .rectangle(0, -26, 95, 16, 0x020617, 0.9)
      .setStrokeStyle(1.5, 0x22c55e, 1);

    const nameText = this.add
      .text(0, -26, `⭐ ${name}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '8.5px',
        color: '#fef08a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.player.add([this.playerShadow, this.playerSprite, nameBg, nameText]);
  }

  private createProximityPrompt() {
    this.proximityPrompt = this.add.container(0, 0).setDepth(30).setVisible(false);

    const bg = this.add
      .rectangle(0, 0, 240, 26, 0x020617, 0.95)
      .setStrokeStyle(2, 0xf59e0b, 1)
      .setInteractive({ useHandCursor: true });

    this.proximityText = this.add
      .text(0, 0, 'Bấm [Space] hoặc [Enter] để vào', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '10.5px',
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
      this.proximityPrompt.setPosition(this.player.x, this.player.y - 45);
      this.proximityText.setText(`[Space / Enter] Vào ${closestBuilding.label}`);
      this.proximityPrompt.setVisible(true);

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
    const { x, y, w, h, label, color, badgeIcon, onClick, isHero } = options;

    const container = this.add.container(x, y);

    const hitZone = this.add
      .rectangle(0, 0, w, h, color, 0.001)
      .setInteractive({ useHandCursor: true });

    const highlightBox = this.add
      .rectangle(0, 0, w + 8, h + 8, color, 0.15)
      .setStrokeStyle(2, 0xffffff, 0)
      .setVisible(false);

    const labelW = Math.max(72, label.length * 7.2 + 22);
    const labelBox = this.add
      .rectangle(0, -h / 2 - 12, labelW, 20, 0x020617, 0.92)
      .setStrokeStyle(1.5, color, 1);

    const labelText = this.add
      .text(0, -h / 2 - 12, `${badgeIcon} ${label}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: isHero ? '10.5px' : '9px',
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
        scale: isHero ? 1.04 : 1.06,
        y: y - 4,
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
