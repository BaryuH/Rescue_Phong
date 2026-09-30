import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';
import { HUB_BLOCKERS, HUB_ZONES, HubZone, WORLD_H, WORLD_W } from '../../data/hub-zones';

interface InteractiveTarget {
  x: number;
  y: number;
  label: string;
  onClick: () => void;
  /** Hiệu ứng bật sáng khi người chơi tới gần */
  setHighlight: (on: boolean) => void;
}

interface ObstacleBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Dải vỉa hè + lòng đường mà nhân vật được phép đi (vật cản lo phần chặn nhà) */
const WALK_TOP = 180;
const WALK_BOTTOM = 304;
const WALK_PADDING_X = 10;

/** Bán kính kích hoạt bong bóng tương tác */
const INTERACT_RADIUS = 58;

export class HubScene extends Scene {
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;

  private prompt!: Phaser.GameObjects.Container;
  private promptLabel!: Phaser.GameObjects.Text;
  private nearbyTarget: InteractiveTarget | null = null;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key;
  };

  private virtualDir = 'stop';
  private playerSkin = 0;
  private walkStepTimer = 0;
  private walkStepFrame = false;
  private lastFacing: 'down' | 'up' | 'left' | 'right' = 'down';
  private broadcastTimer = 0;
  private entering = false;

  private targets: InteractiveTarget[] = [];
  private obstacles: ObstacleBox[] = [];

  constructor() {
    super('HubScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const progress = loadProgress();
    this.playerSkin = progress.playerSkin || 0;
    this.targets = [];
    this.entering = false;

    // 1. Nền thành phố pixel, vẽ đúng kích thước gốc trong toạ độ thế giới
    this.add.image(0, 0, 'city-base').setOrigin(0, 0).setDisplaySize(WORLD_W, WORLD_H);

    // 2. Vật cản: từng khối nhà đo trực tiếp trên ảnh nền (xe cộ đi xuyên được)
    this.obstacles = HUB_BLOCKERS.map((b) => ({ ...b }));

    // 3. Biển hiệu + thảm cửa cho từng khu
    HUB_ZONES.forEach((zone) => this.createZoneMarker(zone));

    // 4. Nhân vật + bụi bước chân
    this.createDustTexture();
    this.createPlayer(480, 248, progress.playerName || 'Tân Binh Thể Chế');

    // 5. Bong bóng nhắc tương tác
    this.createPrompt();

    // 6. Camera: zoom phủ kín khung hình rồi bám nhân vật
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.setRoundPixels(true);
    this.applyCameraZoom();
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.fadeIn(420, 7, 10, 18);

    this.scale.on('resize', this.applyCameraZoom, this);

    // 7. Điều khiển
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        ENTER: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
    }

    EventBus.on('virtual-dpad-move', this.handleVirtualMove, this);
    EventBus.on('virtual-action', this.handleVirtualAction, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyCameraZoom, this);
      EventBus.off('virtual-dpad-move', this.handleVirtualMove, this);
      EventBus.off('virtual-action', this.handleVirtualAction, this);
    });
  }

  private handleVirtualMove = (data: { dir: string }) => {
    this.virtualDir = data.dir;
  };

  private handleVirtualAction = () => {
    if (this.nearbyTarget) this.nearbyTarget.onClick();
  };

  /** Zoom sao cho thế giới luôn phủ kín khung, không để lộ viền đen */
  private applyCameraZoom() {
    const { width, height } = this.scale;
    if (!width || !height) return;
    const zoom = Math.max(width / WORLD_W, height / WORLD_H, 1);
    this.cameras.main.setZoom(zoom);
  }

  // ============================================================
  // BIỂN HIỆU KHU VỰC
  // ============================================================
  private createZoneMarker(zone: HubZone) {
    const { x, y, w, h, color, icon, name, signY } = zone;

    const enter = () => {
      if (this.entering) return;
      this.entering = true;
      this.cameras.main.flash(180, 255, 255, 255, false);
      this.cameras.main.fadeOut(220, 7, 10, 18);
      this.time.delayedCall(200, () => {
        EventBus.emit('request-transition', {
          target: zone.target,
          label: zone.transitionLabel,
          variant: zone.variant,
        });
      });
    };

    // --- Thảm cửa phát sáng đúng bề ngang khung cửa thật ---
    const mat = this.add
      .rectangle(x, y, w, h, color, 0.22)
      .setStrokeStyle(1, color, 0.75)
      .setDepth(4);

    // Vùng bấm nới rộng hơn thảm để chuột dễ trúng
    const hit = this.add
      .zone(x, y - 4, Math.max(w + 14, 44), h + 26)
      .setOrigin(0.5)
      .setDepth(6)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: mat,
      fillAlpha: 0.42,
      yoyo: true,
      repeat: -1,
      duration: 1100,
      ease: 'Sine.easeInOut',
    });

    // --- Mũi tên nhấp nháy chỉ vào cửa ---
    const arrow = this.add
      .triangle(x, y - 14, 0, 0, 9, 0, 4.5, 6, color, 0.95)
      .setDepth(5);

    this.tweens.add({
      targets: arrow,
      y: y - 9,
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: 'Sine.easeInOut',
    });

    // --- Biển hiệu lơ lửng trên mái hiên ---
    const sign = this.add.container(x, signY).setDepth(12);

    const label = this.add
      .text(0, 0, name, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '7px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const iconText = this.add
      .text(0, 0, icon, { fontFamily: 'Be Vietnam Pro', fontSize: '8px' })
      .setOrigin(0.5);

    const panelW = label.width + 25;
    const panelH = 15;

    const panel = this.add.graphics();
    panel.fillStyle(0x080c16, 0.9);
    panel.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
    panel.lineStyle(1, color, 1);
    panel.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
    // đuôi nhọn chỉ xuống cửa
    panel.fillStyle(color, 1);
    panel.fillTriangle(-3, panelH / 2, 3, panelH / 2, 0, panelH / 2 + 4);

    iconText.setX(-panelW / 2 + 9);
    label.setX(-panelW / 2 + 17);

    // vạch màu bám mép trái làm điểm nhấn
    const accent = this.add.graphics();
    accent.fillStyle(color, 1);
    accent.fillRoundedRect(-panelW / 2 + 2, -panelH / 2 + 3, 2, panelH - 6, 1);

    sign.add([panel, accent, iconText, label]);

    this.tweens.add({
      targets: sign,
      y: signY - 3,
      yoyo: true,
      repeat: -1,
      duration: 1600,
      ease: 'Sine.easeInOut',
    });

    const setHighlight = (on: boolean) => {
      this.tweens.add({
        targets: sign,
        scale: on ? 1.14 : 1,
        duration: 160,
        ease: 'Back.easeOut',
      });
      label.setColor(on ? '#fde68a' : '#f8fafc');
      mat.setStrokeStyle(on ? 2 : 1, on ? 0xfde68a : color, on ? 1 : 0.75);
      arrow.setAlpha(on ? 1 : 0.95);
    };

    hit.on('pointerover', () => setHighlight(true));
    hit.on('pointerout', () => setHighlight(this.nearbyTarget?.label === name));
    hit.on('pointerdown', enter);

    this.targets.push({ x, y, label: name, onClick: enter, setHighlight });
  }

  // ============================================================
  // NHÂN VẬT
  // ============================================================
  private createDustTexture() {
    if (this.textures.exists('hub-dust')) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xd8d2c4, 1);
    g.fillRect(0, 0, 3, 3);
    g.generateTexture('hub-dust', 3, 3);
    g.destroy();
  }

  private createPlayer(x: number, y: number, name: string) {
    this.dust = this.add.particles(0, 0, 'hub-dust', {
      speed: { min: 6, max: 20 },
      angle: { min: 200, max: 340 },
      lifespan: 420,
      scale: { start: 1, end: 0 },
      alpha: { start: 0.55, end: 0 },
      frequency: 90,
      quantity: 1,
    });
    this.dust.setDepth(18);
    this.dust.stop();

    this.player = this.add.container(x, y).setDepth(20);

    this.playerShadow = this.add.ellipse(0, 16, 20, 8, 0x000000, 0.42).setOrigin(0.5);

    this.playerSprite = this.add
      .image(0, 0, `char_${this.playerSkin}_down`)
      .setScale(2)
      .setOrigin(0.5);

    const nameText = this.add
      .text(0, -22, name, {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '6.5px',
        color: '#fde68a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    nameText.setStroke('#080c16', 3);

    this.player.add([this.playerShadow, this.playerSprite, nameText]);
  }

  // ============================================================
  // BONG BÓNG TƯƠNG TÁC (kiểu phím bấm)
  // ============================================================
  private createPrompt() {
    this.prompt = this.add.container(0, 0).setDepth(30).setVisible(false);

    const panelH = 17;
    const keycapW = 30;

    this.promptLabel = this.add
      .text(0, 0, '', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '7px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const panelW = 118;

    const panel = this.add.graphics();
    panel.fillStyle(0x080c16, 0.94);
    panel.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
    panel.lineStyle(1, 0xfde68a, 1);
    panel.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
    panel.fillStyle(0x080c16, 0.94);
    panel.fillTriangle(-4, -panelH / 2, 4, -panelH / 2, 0, -panelH / 2 - 4);

    const keycap = this.add.graphics();
    keycap.fillStyle(0xfde68a, 1);
    keycap.fillRoundedRect(-panelW / 2 + 5, -5, keycapW, 10, 2);

    const keyText = this.add
      .text(-panelW / 2 + 5 + keycapW / 2, 0, 'SPACE', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '6px',
        color: '#080c16',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.promptLabel.setX(-panelW / 2 + keycapW + 11);

    const hit = this.add
      .zone(0, 0, panelW, panelH)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => this.nearbyTarget?.onClick());

    this.prompt.add([panel, keycap, keyText, this.promptLabel, hit]);
  }

  private overlaps(a: ObstacleBox, b: ObstacleBox): boolean {
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  }

  private blocked(box: ObstacleBox): boolean {
    for (const obs of this.obstacles) {
      if (this.overlaps(box, obs)) return true;
    }
    return false;
  }

  update(_time: number, delta: number) {
    if (!this.player) return;

    const speed = 2.9;
    let dx = 0;
    let dy = 0;
    let facing = this.lastFacing;

    const left = this.cursors?.left?.isDown || this.keys?.A.isDown || this.virtualDir === 'left';
    const right = this.cursors?.right?.isDown || this.keys?.D.isDown || this.virtualDir === 'right';
    const up = this.cursors?.up?.isDown || this.keys?.W.isDown || this.virtualDir === 'up';
    const down = this.cursors?.down?.isDown || this.keys?.S.isDown || this.virtualDir === 'down';

    if (left) {
      dx -= speed;
      facing = 'left';
    } else if (right) {
      dx += speed;
      facing = 'right';
    }

    if (up) {
      dy -= speed;
      facing = 'up';
    } else if (down) {
      dy += speed;
      facing = 'down';
    }

    // Đi chéo không được nhanh hơn đi thẳng
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    const isMoving = dx !== 0 || dy !== 0;

    if (isMoving) {
      this.lastFacing = facing;

      const nextX = Phaser.Math.Clamp(
        this.player.x + dx,
        WALK_PADDING_X,
        WORLD_W - WALK_PADDING_X
      );
      if (
        !this.blocked({
          x1: nextX - 9,
          x2: nextX + 9,
          y1: this.player.y + 6,
          y2: this.player.y + 16,
        })
      ) {
        this.player.x = nextX;
      }

      const nextY = Phaser.Math.Clamp(this.player.y + dy, WALK_TOP, WALK_BOTTOM);
      if (
        !this.blocked({
          x1: this.player.x - 9,
          x2: this.player.x + 9,
          y1: nextY + 6,
          y2: nextY + 16,
        })
      ) {
        this.player.y = nextY;
      }

      this.walkStepTimer += delta;
      if (this.walkStepTimer > 140) {
        this.walkStepTimer = 0;
        this.walkStepFrame = !this.walkStepFrame;
      }

      this.playerSprite.setTexture(
        this.walkStepFrame
          ? `char_${this.playerSkin}_walk_${facing}`
          : `char_${this.playerSkin}_${facing}`
      );

      // nhún nhẹ theo nhịp bước cho đỡ cứng
      this.playerSprite.setY(this.walkStepFrame ? -1 : 0);
      this.playerShadow.setScale(this.walkStepFrame ? 0.9 : 1, 1);

      this.dust.setPosition(this.player.x, this.player.y + 15);
      this.dust.start();
    } else {
      this.playerSprite.setTexture(`char_${this.playerSkin}_${this.lastFacing}`);
      this.playerSprite.setY(0);
      this.playerShadow.setScale(1, 1);
      this.dust.stop();
    }

    // --- Tìm cửa gần nhất ---
    let closest: InteractiveTarget | null = null;
    let minDist = INTERACT_RADIUS;

    for (const target of this.targets) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        target.x,
        target.y
      );
      if (dist < minDist) {
        minDist = dist;
        closest = target;
      }
    }

    if (closest !== this.nearbyTarget) {
      this.nearbyTarget?.setHighlight(false);
      closest?.setHighlight(true);
      this.nearbyTarget = closest;

      if (closest) {
        this.promptLabel.setText(`Vào ${closest.label}`);
        this.prompt.setScale(0.8).setAlpha(0);
        this.tweens.add({
          targets: this.prompt,
          scale: 1,
          alpha: 1,
          duration: 180,
          ease: 'Back.easeOut',
        });
      }
      this.prompt.setVisible(!!closest);
      EventBus.emit('hub-near-zone', { label: closest?.label ?? null });
    }

    if (this.nearbyTarget) {
      // Đặt dưới chân nhân vật để không đè lên biển hiệu toà nhà
      this.prompt.setPosition(this.player.x, this.player.y + 34);
      if (
        (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) ||
        (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.ENTER))
      ) {
        this.nearbyTarget.onClick();
      }
    }

    // --- Phát toạ độ cho minimap React ---
    this.broadcastTimer += delta;
    if (this.broadcastTimer > 90) {
      this.broadcastTimer = 0;
      const view = this.cameras.main.worldView;
      EventBus.emit('hub-player-move', {
        x: this.player.x / WORLD_W,
        y: this.player.y / WORLD_H,
        viewX: view.x / WORLD_W,
        viewY: view.y / WORLD_H,
        viewW: view.width / WORLD_W,
        viewH: view.height / WORLD_H,
      });
    }
  }
}
