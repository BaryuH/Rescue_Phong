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

    // 1. Lớp nền thành phố chuẩn mực có viền gạch đỏ 1 block bao quanh màn hình
    this.add
      .image(0, 0, 'city-base')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // ============================================================
    // 2. CỬA TÒA NHÀ TRÊN VỈA HÈ (GROUND-LEVEL ENTRANCES)
    // ============================================================

    // 📚 1. Thư Viện Tri Thức (Tây Bắc)
    this.createBuildingPortal({
      x: 101,
      y: 220,
      w: 85,
      h: 36,
      label: 'Thư Viện Tri Thức',
      icon: '📚',
      color: 0x10b981,
      doorY: 190,
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
      y: 220,
      w: 80,
      h: 36,
      label: 'Đài Quan Sát',
      icon: '🔭',
      color: 0x0ea5e9,
      doorY: 190,
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
      y: 220,
      w: 110,
      h: 42,
      label: 'Tòa Thử Thách',
      icon: '🎯',
      color: 0xf59e0b,
      doorY: 185,
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
      y: 220,
      w: 95,
      h: 36,
      label: 'Chợ Thuật Ngữ',
      icon: '🗄️',
      color: 0x14b8a6,
      doorY: 185,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'knowledge',
          label: 'Nhà Lưu Trữ • Tra Cứu Thuật Ngữ',
          variant: 'default',
        });
      },
    });

    // ⚔️ 5. PHỐ THỂ CHẾ (KHU 1) - TÒA NHÀ PHONG (Góc Tây Nam - Cửa duy nhất vào Khu 1)
    this.createBuildingPortal({
      x: 104,
      y: 508,
      w: 95,
      h: 36,
      label: 'Phố Thể Chế (Khu 1)',
      icon: '⚔️',
      color: 0xef4444,
      doorY: 465,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'battle',
          label: 'Phố Thể Chế (Khu 1) • Giao Đấu Tình Huống',
          variant: 'battle',
        });
      },
    });

    // ============================================================
    // 3. CHỐT CHẶN MỞ KHÓA MAP 2 (ĐÔNG ĐẠI LỘ)
    // ============================================================
    this.createEastDistrict2Checkpoint(width, height, isKhu2Open);

    // ============================================================
    // 4. NHÂN VẬT NGƯỜI CHƠI (SPAWN TẠI VỈA HÈ CÔNG VIÊN)
    // ============================================================
    this.createPlayer(456, 406, progress.playerName || 'Nhà Cải Cách');

    // ============================================================
    // 5. BONG BÓNG TƯƠNG TÁC
    // ============================================================
    this.createProximityPrompt();

    // ============================================================
    // 6. THANH HƯỚNG DẪN DƯỚI ĐÁY
    // ============================================================
    this.add
      .text(
        width / 2,
        height - 10,
        '🎮 Dùng [W-A-S-D] / [Mũi Tên] đi đến trước cửa các tòa nhà để bước vào • Hoặc nhấp chuột trực tiếp!',
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
    // 7. BÀN PHÍM VÀ D-PAD
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
      this.player.x = Phaser.Math.Clamp(this.player.x + dx, 26, this.scale.width - 26);
      this.player.y = Phaser.Math.Clamp(this.player.y + dy, 215, this.scale.height - 30);

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
      .rectangle(0, 0, w, 22, color, 0.25)
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

  private createRoadPortal(options: InteractivePortal) {
    this.interactiveTargets.push({ ...options, isPortal: true });
    const { x, y, w, h, label, icon, color, onClick } = options;

    const container = this.add.container(x, y).setDepth(15);

    const portalBox = this.add
      .rectangle(0, 0, w, h, 0x0a0a0f, 0.92)
      .setStrokeStyle(2, color, 1)
      .setInteractive({ useHandCursor: true });

    const portalText = this.add
      .text(0, 0, `${icon} ${label}`, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '10px',
        color: '#ffd93d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: portalText,
      y: '+=3',
      yoyo: true,
      repeat: -1,
      duration: 600,
    });

    portalBox.on('pointerdown', onClick);
    container.add([portalBox, portalText]);

    return container;
  }

  private createEastDistrict2Checkpoint(width: number, height: number, isOpen: boolean) {
    const cp_x = 836;
    const cp_y = 285;

    if (isOpen) {
      this.createRoadPortal({
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
