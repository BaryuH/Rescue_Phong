import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';

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

    const { width, height } = this.scale;
    this.interactiveTargets = [];
    this.obstacles = [];

    // 1. Lớp nền thành phố nửa trên theo đúng ảnh yêu cầu (950x352)
    this.add
      .image(0, 0, 'city-base')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // ============================================================
    // 2. VẬT CẢN VA CHẠM: CHẶN TƯỜNG NHÀ PHÍA BẮC & RÀO PHÍA NAM
    // (Cho phép đi xuyên qua xe cộ thoải mái)
    // ============================================================
    this.obstacles = [
      // Toàn bộ mái và tường các tòa nhà phía Bắc (y <= 218)
      { x1: 0, y1: 0, x2: width, y2: 218 },

      // Bờ gạch đỏ viền phía Nam (y >= 334)
      { x1: 0, y1: 334, x2: width, y2: height },
    ];

    // ============================================================
    // 3. CỬA TÒA NHÀ TRÊN VỈA HÈ BẮC (GROUND-LEVEL ENTRANCES)
    // ============================================================

    // 📚 1. Thư Viện Tri Thức (Tây Bắc)
    this.createBuildingPortal({
      x: 101,
      y: 220,
      w: 85,
      h: 28,
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

    // ⚔️ 2. Đài Quan Sát (Đấu Trường Thể Chế - Giao đấu NPC)
    this.createBuildingPortal({
      x: 281,
      y: 220,
      w: 80,
      h: 28,
      label: 'Đấu Trường Thể Chế',
      icon: '⚔️',
      color: 0xef4444,
      doorY: 190,
      onClick: () => {
        EventBus.emit('request-transition', {
          target: 'battle',
          label: 'Đài Quan Sát • Đấu Trường Thể Chế',
          variant: 'battle',
        });
      },
    });

    // 🎯 3. Tòa Thử Thách (Cao ốc trung tâm có biển cam)
    this.createBuildingPortal({
      x: 496,
      y: 220,
      w: 110,
      h: 28,
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

    // 🗄️ 4. Chợ Thuật Ngữ (Cửa hàng có mái hiên xanh)
    this.createBuildingPortal({
      x: 716,
      y: 220,
      w: 95,
      h: 28,
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

    // ============================================================
    // 4. LỐI ĐI SANG CÁC MAP KHÁC (ROAD PORTALS)
    // ============================================================


    // ============================================================
    // 5. NHÂN VẬT NGƯỜI CHƠI (SPAWN TẠI VỈA HÈ TRUNG TÂM)
    // ============================================================
    this.createPlayer(496, 260, progress.playerName || 'Nhà Cải Cách');

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
        height - 8,
        '🎮 Dùng [W-A-S-D] / [Mũi Tên] đi lại tự do trên vỉa hè & lòng đường • Bấm [Space / Enter] trước cửa để vào!',
        {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '9.5px',
          color: '#fef08a',
          backgroundColor: '#0a0a0ff0',
          padding: { x: 10, y: 2 },
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

      // KIỂM TRA VA CHẠM: CHẶN TƯỜNG TÒA NHÀ PHÍA BẮC & RÀO NAM, CHO PHÉP ĐI XUYÊN XE CỘ
      const nextX = Phaser.Math.Clamp(this.player.x + dx, 26, this.scale.width - 26);
      const playerBoxX: ObstacleBox = {
        x1: nextX - 9,
        x2: nextX + 9,
        y1: this.player.y + 6,
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

      // Giới hạn Y: từ vỉa hè phía Bắc (y=220) đến mép đường phía Nam (y=328)
      const nextY = Phaser.Math.Clamp(this.player.y + dy, 220, 328);
      const playerBoxY: ObstacleBox = {
        x1: this.player.x - 9,
        x2: this.player.x + 9,
        y1: nextY + 6,
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

    // Kiểm tra khoảng cách tới các cửa để hiện prompt tương tác
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

    portalBox.on('pointerdown', onClick);
    container.add([portalBox, portalText]);

    return container;
  }

}
