import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';
import npcsData from '../../data/npcs.json';

interface NPCNode {
  id: string;
  name: string;
  role: string;
  dialogue: string;
  x: number;
  y: number;
  scenarioId: string;
  spriteIndex: number;
  container?: Phaser.GameObjects.Container;
  exclamation?: Phaser.GameObjects.Text;
}

export class OverworldScene extends Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };
  private virtualDir: string = 'stop';
  private npcs: NPCNode[] = [];
  private activeNearbyNPC: NPCNode | null = null;

  constructor() {
    super('OverworldScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const { width, height } = this.scale;

    // 1. Nền bản đồ thành phố
    this.add.image(0, 0, 'city-base').setOrigin(0, 0).setDisplaySize(width, height);

    // Lớp phủ phân khu tập trung vào Phố Thể Chế (phía Nam)
    this.add.rectangle(0, 0, width, height * 0.45, 0x020617, 0.45).setOrigin(0, 0);

    // Biển chỉ dẫn
    this.add
      .text(width / 2, 28, 'PHỐ THỂ CHẾ (KHU KINH DOANH 1)', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '18px',
        color: '#f8fafc',
        fontStyle: 'bold',
        backgroundColor: '#0f172a',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 60, 'Dùng phím W-A-S-D hoặc D-Pad để di chuyển tới các NPC và bấm Space / nhấp chuột để bắt chuyện', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '11px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5);

    // 2. Thiết lập 6 NPC đại diện các chủ thể kinh tế Khu 1
    const npcConfigs: NPCNode[] = [
      {
        id: 'npc_dn_tu_nhan_nam_long',
        name: 'Giám đốc Nam Long',
        role: 'Doanh nghiệp tư nhân',
        dialogue: npcsData[0].dialogue,
        x: width * 0.15,
        y: height * 0.75,
        scenarioId: 'scenario_binh_dang_nguon_luc',
        spriteIndex: 0,
      },
      {
        id: 'npc_startup_tri_viet',
        name: 'Kỹ sư Trí Việt',
        role: 'Startup công nghệ',
        dialogue: npcsData[1].dialogue,
        x: width * 0.3,
        y: height * 0.75,
        scenarioId: 'scenario_so_huu_tri_tue_cong_nghe',
        spriteIndex: 1,
      },
      {
        id: 'npc_htx_bac_ba',
        name: 'Chủ nhiệm Bác Ba',
        role: 'Hợp tác xã nông nghiệp',
        dialogue: npcsData[2].dialogue,
        x: width * 0.45,
        y: height * 0.75,
        scenarioId: 'scenario_hop_tac_xa_nong_san',
        spriteIndex: 2,
      },
      {
        id: 'npc_fdi_globaltech',
        name: 'Đại diện GlobalTech',
        role: 'Tập đoàn FDI',
        dialogue: npcsData[3].dialogue,
        x: width * 0.6,
        y: height * 0.75,
        scenarioId: 'scenario_dau_tu_fdi_cong_nghe',
        spriteIndex: 3,
      },
      {
        id: 'npc_quan_ly_dau_thau',
        name: 'Trưởng ban Đấu thầu',
        role: 'Ban Quản lý Đấu thầu',
        dialogue: npcsData[4].dialogue,
        x: width * 0.75,
        y: height * 0.75,
        scenarioId: 'scenario_minh_bach_dau_thau_cong',
        spriteIndex: 4,
      },
      {
        id: 'npc_boss_dnnn_hoang_gia',
        name: 'Chủ tịch Hoàng Gia',
        role: 'Trùm Khu 1 (DNNN)',
        dialogue: npcsData[5].dialogue,
        x: width * 0.9,
        y: height * 0.75,
        scenarioId: 'scenario_cai_to_dnnn_then_chot',
        spriteIndex: 5,
      },
    ];

    this.npcs = npcConfigs;

    // Vẽ từng NPC
    this.npcs.forEach((npc) => {
      const container = this.add.container(npc.x, npc.y);

      // Thân NPC
      const body = this.add.rectangle(0, 0, 24, 30, 0x3b82f6, 0.9).setStrokeStyle(1.5, 0xffffff);

      // Nhãn tên NPC
      const nameTag = this.add
        .text(0, -26, npc.name, {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '9px',
          color: '#ffffff',
          backgroundColor: '#0f172a',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5);

      // Bong bóng "!" khi đến gần
      const exclamation = this.add
        .text(0, -42, ' ! ', {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '13px',
          color: '#020617',
          backgroundColor: '#fbbf24',
          fontStyle: 'bold',
          padding: { x: 4, y: 1 },
        })
        .setOrigin(0.5)
        .setVisible(false);

      container.add([body, nameTag, exclamation]);
      container.setSize(30, 40).setInteractive({ useHandCursor: true });

      container.on('pointerdown', () => {
        this.interactWithNPC(npc);
      });

      npc.container = container;
      npc.exclamation = exclamation;
    });

    // 3. Nhân vật người chơi
    const progress = loadProgress();
    const spawnX = width * 0.5;
    const spawnY = height * 0.6;

    this.player = this.add.container(spawnX, spawnY);
    this.playerBody = this.add
      .rectangle(0, 0, 24, 30, 0x22c55e, 1)
      .setStrokeStyle(2, 0xffffff);

    const playerNameTag = this.add
      .text(0, -24, progress.playerName || 'Nhà Cải Cách', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '9px',
        color: '#fef08a',
        backgroundColor: '#020617',
        padding: { x: 4, y: 1 },
      })
      .setOrigin(0.5);

    this.player.add([this.playerBody, playerNameTag]);

    // 4. Phím điều khiển
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };
    }

    // Lắng nghe D-Pad ảo từ mobile
    EventBus.on('virtual-dpad-move', (data: { dir: string }) => {
      this.virtualDir = data.dir;
    });

    EventBus.on('virtual-action', () => {
      if (this.activeNearbyNPC) {
        this.interactWithNPC(this.activeNearbyNPC);
      }
    });
  }

  update() {
    if (!this.player) return;

    const speed = 3.2;
    let dx = 0;
    let dy = 0;

    // Bàn phím WASD / Mũi tên
    if (this.cursors?.left.isDown || this.wasd?.A.isDown || this.virtualDir === 'left') {
      dx -= speed;
    }
    if (this.cursors?.right.isDown || this.wasd?.D.isDown || this.virtualDir === 'right') {
      dx += speed;
    }
    if (this.cursors?.up.isDown || this.wasd?.W.isDown || this.virtualDir === 'up') {
      dy -= speed;
    }
    if (this.cursors?.down.isDown || this.wasd?.S.isDown || this.virtualDir === 'down') {
      dy += speed;
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + dx, 30, this.scale.width - 30);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, this.scale.height * 0.5, this.scale.height - 40);

    // Kiểm tra khoảng cách tới các NPC
    let foundNearby: NPCNode | null = null;
    this.npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < 55) {
        foundNearby = npc;
        npc.exclamation?.setVisible(true);
      } else {
        npc.exclamation?.setVisible(false);
      }
    });

    this.activeNearbyNPC = foundNearby;

    // Bấm phím Space khi đứng gần NPC để bắt chuyện
    if (Phaser.Input.Keyboard.JustDown(this.wasd?.SPACE) && this.activeNearbyNPC) {
      this.interactWithNPC(this.activeNearbyNPC);
    }
  }

  private interactWithNPC(npc: NPCNode) {
    EventBus.emit('open-npc-dialogue', {
      npcId: npc.id,
      name: npc.name,
      role: npc.role,
      dialogue: npc.dialogue,
      scenarioId: npc.scenarioId,
    });
  }
}
