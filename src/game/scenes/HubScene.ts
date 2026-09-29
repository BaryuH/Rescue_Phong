import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';
import { isKhu2Unlocked, REQUIRED_BADGES_FOR_KHU_2 } from '../../systems/progress';

interface InteractivePortal {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  icon: string;
  color: number;
  onClick: () => void;
  doorY?: number;
  isPortal?: boolean;
}

interface ObstacleBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export class HubScene extends Scene {
  private clouds: Phaser.GameObjects.Image[] = [];
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private proximityPrompt!: Phaser.GameObjects.Container;
  private proximityText!: Phaser.GameObjects.Text;
  private nearbyTarget: InteractivePortal | null = null;

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

  private interactiveTargets: InteractivePortal[] = [];
  private obstacles: ObstacleBox[] = [];

  constructor() {
    super('HubScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const progress = loadProgress();
    this.playerSkin = progress.playerSkin || 0;
    const isKhu2Open = isKhu2Unlocked(progress.badges);

    const { width, height } = this.scale;
    this.interactiveTargets = [];
    this.obstacles = [];

    // 1. Lớp nền thành phố chuẩn mực có viền gạch đỏ 1 block (950x547)
    this.add
      .image(0, 0, 'city-base')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // ============================================================
    // 2. DANH SÁCH VẬT CẢN (KHÔNG ĐƯỢC BƯỚC LÊN TÒA NHÀ & XE CỘ)
    // ============================================================
    this.obstacles = [
      // Toàn bộ dãy tòa nhà phía Bắc (Thư Viện, Đài Quan Sát, Tòa Thử Thách, Chợ)
      { x1: 0, y1: 0, x2: width, y2: 220 },

      // Tòa nhà công vụ góc Tây Nam (Mặt tiền gạch & cửa)
      { x1: 0, y1: 376, x2: 206, y2: height },

      // Xe cam ở giữa ngã tư
      { x1: 450, y1: 300, x2: 505, y2: 345 },

      // Xe xanh lá cây trên làn đường phía Tây
      { x1: 192, y1: 328, x2: 252, y2: 370 },

      // Xe xanh lá cây trên phố nhánh phía Bắc
      { x1: 605, y1: 238, x2: 658, y2: 288 },
    ];

    // Nếu Khu 2 đang khóa -> chặn luôn toàn bộ khu công nghiệp phía Đông
    if (!isKhu2Open) {
      this.obstacles.push({ x1: 670, y1: 296, x2: width, y2: height });
    }

    // ============================================================
    // 3. CỬA TÒA NHÀ TRÊN VỈA HÈ (GROUND-LEVEL ENTRANCES)
    // ============================================================

    // 📚 1. Thư Viện Tri Thức (Tây Bắc)
    this.createBuildingPortal({
      x: 101,
      y: 224,
      w: 85,
      h: 30,
      label: 'Thư Viện Tri Thức',
      icon: '📚',
      color: 0x10b981,
      doorY: 192,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Khu Tri Thức • Thư Viện Bài Học',
          variant: 'default',
        });
      },
    });

    // 🔭 2. Đài Quan Sát (Đông Bắc của dãy trường học)
    this.createBuildingPortal({
      x: 281,
      y: 224,
      w: 80,
      h: 30,
      label: 'Đài Quan Sát',
      icon: '🔭',
      color: 0x0ea5e9,
      doorY: 192,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Đài Quan Sát • Sơ Đồ Tư Duy',
          variant: 'default',
        });
      },
    });

    // 🎯 3. Tòa Thử Thách (Cao ốc trung tâm)
    this.createBuildingPortal({
      x: 496,
      y: 224,
      w: 110,
      h: 32,
      label: 'Tòa Thử Thách',
      icon: '🎯',
      color: 0xf59e0b,
      doorY: 188,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'quiz',
          label: 'Tòa Thử Thách • Thung Lũng Quiz',
          variant: 'default',
        });
      },
    });

    // 🗄️ 4. Chợ Thuật Ngữ (Cửa hàng mái hiên phía Đông Bắc)
    this.createBuildingPortal({
      x: 716,
      y: 224,
      w: 95,
      h: 30,
      label: 'Chợ Thuật Ngữ',
      icon: '🗄️',
      color: 0x14b8a6,
      doorY: 188,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Nhà Lưu Trữ • Tra Cứu Thuật Ngữ',
          variant: 'default',
        });
      },
    });

    // ⚔️ 5. PHỐ THỂ CHẾ (KHU 1) - Cửa duy nhất tại tòa nhà công vụ góc Tây Nam
    this.createBuildingPortal({
      x: 104,
      y: 382,
      w: 95,
      h: 30,
      label: 'Phố Thể Chế (Khu 1)',
      icon: '⚔️',
      color: 0xef4444,
      doorY: 348,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'battle',
          label: 'Phố Thể Chế (Khu 1) • Giao Đấu Tình Huống',
          variant: 'battle',
        });
      },
    });

    // ============================================================
    // 4. CHỐT CHẶN MỞ KHÓA MAP 2 (ĐÔNG ĐẠI LỘ)
    // ============================================================
    this.createEastDistrict2Checkpoint(width, height, isKhu2Open);

    // ============================================================
    // 5. NHÂN VẬT NGƯỜI CHƠI (SPAWN TẠI VỈA HÈ CÔNG VIÊN)
    // ============================================================
    this.createPlayer(456, 406, progress.playerName || 'Nhà Cải Cách');

    // ============================================================
    // 6. BONG BÓNG TƯƠNG TÁC
    // ============================================================
    this.createProximityPrompt();

    // ============================================================
    // 7. THANH HƯỚNG DẪN DƯỚI ĐÁY
    // ============================================================
    this.add
      .text(
        width / 2,
        height - 10,
        '🎮 Dùng [W-A-S-D] / [Mũi Tên] đi trên vỉa hè & đường phố đến trước cửa các tòa nhà để vào • Hoặc nhấp chuột trực tiếp!',
        {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '10px',
          color: '#fef08a',
          backgroundColor: '#0a0a0ff0',
          padding: { x: 12, y: 2 },
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setDepth(25);

    // ============================================================
    // 8. BÀN PHÍM VÀ D-PAD
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
      if (this.nearbyTarget) {
        this.nearbyTarget.onClick();
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
      .rectangle(0, -24, 94, 16, 0x0a0a0f, 0.9)
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
      .rectangle(0, 0, 260, 26, 0x0a0a0f, 0.95)
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
      if (this.nearbyTarget) {
        this.nearbyTarget.onClick();
      }
    });

    this.proximityPrompt.add([bg, this.proximityText]);
  }

  private checkOverlap(a: ObstacleBox, b: ObstacleBox): boolean {
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
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

      // KIỂM TRA VA CHẠM KHÔNG ĐƯỢC BƯỚC LÊN TÒA NHÀ & XE CỘ
      // 1. Kiểm tra di chuyển theo trục X
      const nextX = Phaser.Math.Clamp(this.player.x + dx, 26, this.scale.width - 26);
      const playerBoxX: ObstacleBox = {
        x1: nextX - 9,
        x2: nextX + 9,
        y1: this.player.y + 4,
        y2: this.player.y + 16,
      };

      let collidesX = false;
      for (const obs of this.obstacles) {
        if (this.checkOverlap(playerBoxX, obs)) {
          collidesX = true;
          break;
        }
      }

      if (!collidesX) {
        this.player.x = nextX;
      }

      // 2. Kiểm tra di chuyển theo trục Y
      const nextY = Phaser.Math.Clamp(this.player.y + dy, 222, this.scale.height - 30);
      const playerBoxY: ObstacleBox = {
        x1: this.player.x - 9,
        x2: this.player.x + 9,
        y1: nextY + 4,
        y2: nextY + 16,
      };

      let collidesY = false;
      for (const obs of this.obstacles) {
        if (this.checkOverlap(playerBoxY, obs)) {
          collidesY = true;
          break;
        }
      }

      if (!collidesY) {
        this.player.y = nextY;
      }

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

    // Kiểm tra khoảng cách tới các cửa và lối đi
    let closest: InteractivePortal | null = null;
    let minDist = 65;

    for (const target of this.interactiveTargets) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      if (dist < minDist) {
        minDist = dist;
        closest = target;
      }
    }

    this.nearbyTarget = closest;

    if (closest) {
      this.proximityPrompt.setPosition(this.player.x, this.player.y - 42);
      this.proximityText.setText(
        closest.isPortal
          ? `[Space / Enter] Đi sang ${closest.label}`
          : `[Space / Enter] Bước vào ${closest.label}`
      );
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

  private createBuildingPortal(options: InteractivePortal) {
    this.interactiveTargets.push(options);
    const { x, y, w, h, label, icon, color, onClick, doorY } = options;

    const container = this.add.container(x, y);

    const doorMat = this.add
      .rectangle(0, 0, w, 20, color, 0.25)
      .setStrokeStyle(1.5, color, 0.8)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: doorMat,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });

    const signY = (doorY ?? y - 35) - y;
    const signW = label.length * 7.4 + 26;

    const signBg = this.add
      .rectangle(0, signY, signW, 20, 0x0a0a0f, 0.92)
      .setStrokeStyle(1.5, color, 1);

    const signText = this.add
      .text(0, signY, `${icon} ${label}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '9.5px',
        color: '#e8e8e8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([doorMat, signBg, signText]);

    doorMat.on('pointerover', () => {
      signBg.setStrokeStyle(2, 0x00fff5, 1);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 120,
      });
    });

    doorMat.on('pointerout', () => {
      signBg.setStrokeStyle(1.5, color, 1);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 120,
      });
    });

    doorMat.on('pointerdown', onClick);

    return container;
  }

  private createEastDistrict2Checkpoint(width: number, height: number, isOpen: boolean) {
    const cp_x = 836;
    const cp_y = 285;

    if (isOpen) {
      const container = this.add.container(cp_x, cp_y).setDepth(15);

      const portalBox = this.add
        .rectangle(0, 0, 160, 38, 0x0a0a0f, 0.92)
        .setStrokeStyle(2, 0x39ff14, 1)
        .setInteractive({ useHandCursor: true });

      const portalText = this.add
        .text(0, 0, '➡️ Phố Lợi Ích (Cứu Phong)', {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '10px',
          color: '#ffd93d',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      portalBox.on('pointerdown', () => {
        EventBus.emit('request-transition', {
          target: 'battle-khu2',
          label: 'Phố Lợi Ích (Khu 2) • Giải Cứu Phong',
          variant: 'battle',
        });
      });

      container.add([portalBox, portalText]);

      this.interactiveTargets.push({
        x: cp_x,
        y: cp_y,
        w: 160,
        h: 38,
        label: 'Phố Lợi Ích (Cứu Phong)',
        icon: '➡️',
        color: 0x39ff14,
        onClick: () => {
          EventBus.emit('request-transition', {
            target: 'battle-khu2',
            label: 'Phố Lợi Ích (Khu 2) • Giải Cứu Phong',
            variant: 'battle',
          });
        },
        isPortal: true,
      });

      this.add
        .text(cp_x, cp_y - 28, '✨ ĐÃ MỞ KHÓA MAP 2 ✨', {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '9px',
          color: '#39ff14',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    } else {
      const barrierContainer = this.add
        .container(cp_x, cp_y)
        .setSize(170, 48)
        .setDepth(15)
        .setInteractive({ useHandCursor: true });

      const bg = this.add
        .rectangle(0, 0, 170, 44, 0x0a0a0f, 0.94)
        .setStrokeStyle(2, 0xff4757, 1);

      const title = this.add
        .text(0, -8, '🔒 CHỐT CHẶN MAP 2', {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '10px',
          color: '#ff4757',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const sub = this.add
        .text(0, 9, `Cần ${REQUIRED_BADGES_FOR_KHU_2} Huy hiệu Thể chế`, {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '8px',
          color: '#e8e8e8',
        })
        .setOrigin(0.5);

      barrierContainer.add([bg, title, sub]);

      const onBlocked = () => {
        this.tweens.add({
          targets: barrierContainer,
          x: cp_x + 6,
          yoyo: true,
          repeat: 3,
          duration: 50,
        });

        EventBus.emit('locked-zone-clicked', {
          zone: 'khu-2',
          message: `Chốt chặn đóng! Bạn cần đạt ${REQUIRED_BADGES_FOR_KHU_2} Huy hiệu Thể chế Khu 1 để mở khóa Map 2 giải cứu Phong!`,
        });
      };

      barrierContainer.on('pointerdown', onBlocked);

      this.interactiveTargets.push({
        x: cp_x,
        y: cp_y,
        w: 170,
        h: 48,
        label: 'Chốt chặn Map 2 (Cần 3 Huy hiệu)',
        icon: '🔒',
        color: 0xff4757,
        onClick: onBlocked,
        isPortal: true,
      });

      this.add
        .rectangle(cp_x - 10, 0, width - (cp_x - 10), height, 0x0a0a0f, 0.6)
        .setOrigin(0, 0)
        .setDepth(10);

      const cloudPositions = [
        { x: cp_x + 30, y: 120, key: 'cloud_large', dur: 3400, dist: 15 },
        { x: cp_x + 60, y: 220, key: 'cloud_medium', dur: 2800, dist: 12 },
        { x: cp_x + 35, y: 380, key: 'cloud_large', dur: 3600, dist: 18 },
      ];

      for (const cp of cloudPositions) {
        const c = this.add
          .image(cp.x, cp.y, cp.key)
          .setScale(1.4)
          .setAlpha(0.9)
          .setDepth(12);

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
    }
  }
}
