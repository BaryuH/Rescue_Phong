import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress } from '../../systems/save';
import { RpgDecision } from '../../systems/progress';
import { RPG_BRANCHES_DATA } from '../../data/rpg-branches';
import npcsData from '../../data/npcs.json';

const WORLD_W = 918;
const WORLD_H = 515;
const WALK_MIN_X = 25;
const WALK_MAX_X = 890;
const WALK_MIN_Y = 115;
const WALK_MAX_Y = 485;
const INTERACT_RADIUS = 68;

interface NPCNode {
  id: string;
  name: string;
  role: string;
  dialogue: string;
  x: number;
  y: number;
  scenarioId: string;
  spriteIndex: number;
  facing: 'down' | 'up' | 'left' | 'right';
  chapter: 1 | 2;
  districtTitle: string;
  portraitKey?: string;
  borderColor?: string;
  glowColor?: string;
  isCelebrityToken?: boolean;
  sprite?: Phaser.GameObjects.Image;
  container?: Phaser.GameObjects.Container;
  statusBadge?: Phaser.GameObjects.Container;
  exclamation?: Phaser.GameObjects.Container;
}

export class OverworldScene extends Scene {
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerNameText!: Phaser.GameObjects.Text;
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;

  private prompt!: Phaser.GameObjects.Container;
  private promptLabel!: Phaser.GameObjects.Text;
  private activeNearbyNPC: NPCNode | null = null;
  private isDialogueOpen = false;

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

  private npcs: NPCNode[] = [];
  private handleSaveEvent?: (e: Event) => void;

  constructor() {
    super('OverworldScene');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    const progress = loadProgress();
    this.playerSkin = progress.playerSkin || 0;
    this.npcs = [];
    this.activeNearbyNPC = null;
    this.isDialogueOpen = false;

    // 1. Nền bản đồ Đấu Trường Thể Chế độc lập (918 x 515) theo phong cách Pixel Art
    this.add.image(0, 0, 'arena-base').setOrigin(0, 0).setDisplaySize(WORLD_W, WORLD_H);
    if (this.textures.exists('arena-base')) {
      this.textures.get('arena-base').setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // 2. Vẽ 4 Phân Khu Chủ Đề Rõ Ràng & Bảng Tên Phân Khu
    this.setupDistrictAreas();

    // 3. Thiết lập 10 NPC phân nhóm theo từng câu chuyện & đối đầu trực diện
    this.setupGroupedNPCs(progress.badges, progress.rpgDecisions);

    // 4. Tạo nhân vật người chơi ở ngã tư trung tâm (x: 460, y: 280)
    this.createDustTexture();
    this.createPlayer(460, 280, progress.playerName || 'Nhà Cải Cách');

    // 5. Tạo prompt tương tác
    this.createPrompt();

    // 6. Cấu hình Camera bám người chơi trên bản đồ 918 x 515
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.setRoundPixels(true);
    this.applyCameraZoom();
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.fadeIn(350, 5, 8, 16);

    this.scale.on('resize', this.applyCameraZoom, this);

    // 7. Cấu hình điều khiển phím & chặn phím Space/Enter cuộn trang
    if (this.input) {
      this.input.enabled = true;
    }
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        ENTER: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };

      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.ENTER,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ]);
      this.input.keyboard.resetKeys();
    }

    if (typeof document !== 'undefined') {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      this.game.canvas?.focus?.();
    }

    this.handleSaveEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const detail = customEvent?.detail;
      this.handlePlayerUpdated(detail);
    };

    window.addEventListener('rescue_phong_progress_changed', this.handleSaveEvent);
    window.addEventListener('storage', this.handleSaveEvent);

    // Lắng nghe sự kiện
    EventBus.on('virtual-dpad-move', this.handleVirtualMove, this);
    EventBus.on('virtual-action', this.handleVirtualAction, this);
    EventBus.on('scenario-cleared', this.handleScenarioCleared, this);
    EventBus.on('teleport-district', this.handleTeleportDistrict, this);
    EventBus.on('rpg-dialogue-closed', this.handleDialogueClosed, this);
    EventBus.on('player-updated', this.handlePlayerUpdated, this);

    this.events.on(Phaser.Scenes.Events.WAKE, () => {
      this.handlePlayerUpdated();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyCameraZoom, this);
      if (this.handleSaveEvent) {
        window.removeEventListener('rescue_phong_progress_changed', this.handleSaveEvent);
        window.removeEventListener('storage', this.handleSaveEvent);
      }
      EventBus.off('virtual-dpad-move', this.handleVirtualMove, this);
      EventBus.off('virtual-action', this.handleVirtualAction, this);
      EventBus.off('scenario-cleared', this.handleScenarioCleared, this);
      EventBus.off('teleport-district', this.handleTeleportDistrict, this);
      EventBus.off('rpg-dialogue-closed', this.handleDialogueClosed, this);
      EventBus.off('player-updated', this.handlePlayerUpdated, this);
    });
  }

  private handlePlayerUpdated = (data?: { playerName?: string; playerSkin?: number }) => {
    const progress = loadProgress();
    const newName = data?.playerName || progress.playerName || 'Nhà Cải Cách';
    const newSkin = data?.playerSkin !== undefined ? data.playerSkin : (progress.playerSkin ?? 0);
    this.playerSkin = newSkin;

    if (this.playerSprite) {
      this.playerSprite.setTexture(`char_${this.playerSkin}_${this.lastFacing}`);
    }
    if (this.playerNameText) {
      this.playerNameText.setText(newName);
      this.playerNameText.setOrigin(0.5);
      this.playerNameText.setStroke('#080c16', 3);
    }
  };

  private handleVirtualMove = (data: { dir: string }) => {
    this.virtualDir = data.dir;
  };

  private handleVirtualAction = () => {
    if (this.activeNearbyNPC) {
      this.interactWithNPC(this.activeNearbyNPC);
    }
  };

  private handleScenarioCleared = (scenarioId: string) => {
    const progress = loadProgress();
    const npc = this.npcs.find((n) => n.scenarioId === scenarioId);
    if (npc) {
      this.updateNPCBadge(npc, progress.rpgDecisions?.[scenarioId], true);
    }
  };

  private handleTeleportDistrict = (data: { district: number }) => {
    if (!this.player) return;
    const coords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 240 }, // Khu 1 Nhà Hát Showbiz
      2: { x: 720, y: 230 }, // Khu 2 Xưởng Xe & Rạp Phim
      3: { x: 170, y: 420 }, // Khu 3 Studio Livestream
      4: { x: 700, y: 430 }, // Khu 4 Tòa Án & Trại Giam
    };
    const target = coords[data.district] || { x: 460, y: 280 };
    this.tweens.add({
      targets: this.player,
      x: target.x,
      y: target.y,
      duration: 350,
      ease: 'Power2',
    });
  };

  private applyCameraZoom() {
    const { width, height } = this.scale;
    if (!width || !height) return;
    const zoom = Math.max(width / WORLD_W, height / WORLD_H, 1);
    this.cameras.main.setZoom(zoom);
  }

  // ============================================================
  // THIẾT KẾ 4 PHÂN KHU CHỦ ĐỀ CỦA ĐẤU TRƯỜNG
  // ============================================================
  private setupDistrictAreas() {
    // --------------------------------------------------------
    // NHÀ HÁT NGHỆ THUẬT (GÓC TÂY BẮC)
    // --------------------------------------------------------
    this.createDistrictSign(
      155,
      35,
      '🎵 NHÀ HÁT NGHỆ THUẬT',
      0xa855f7
    );

    // --------------------------------------------------------
    // XƯỞNG XE ĐIỆN & RẠP PHIM (GÓC ĐÔNG BẮC)
    // --------------------------------------------------------
    this.createDistrictSign(
      730,
      35,
      '🚗 XƯỞNG XE ĐIỆN & RẠP PHIM',
      0x10b981
    );

    // --------------------------------------------------------
    // STUDIO LIVESTREAM (GÓC TÂY NAM)
    // --------------------------------------------------------
    this.createDistrictSign(
      170,
      310,
      '🔥 STUDIO LIVESTREAM',
      0xf97316
    );

    // --------------------------------------------------------
    // TÒA ÁN & TRẠI TẠM GIAM (GÓC ĐÔNG NAM)
    // --------------------------------------------------------
    this.createDistrictSign(
      720,
      310,
      '⚖️ TÒA ÁN & TRẠI TẠM GIAM',
      0x3b82f6
    );
  }

  private createDistrictSign(
    x: number,
    y: number,
    title: string,
    color: number
  ) {
    const sign = this.add.container(x, y).setDepth(6);
    const signW = 165;
    const signH = 22;
    const bg = this.add.graphics();
    bg.fillStyle(0x090d16, 0.94);
    bg.fillRoundedRect(-signW / 2, -signH / 2, signW, signH, 5);
    bg.lineStyle(1.5, color, 0.9);
    bg.strokeRoundedRect(-signW / 2, -signH / 2, signW, signH, 5);

    const titleText = this.add
      .text(0, 0, title, {
        fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
        fontSize: '7.5px',
        color: '#f8fafc',
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0.5);

    sign.add([bg, titleText]);

    this.tweens.add({
      targets: sign,
      y: y - 2,
      yoyo: true,
      repeat: -1,
      duration: 1500,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Tạo texture standee nhân vật cho ảnh đã xóa nền (cutout) hoặc ảnh chân dung (không cắt tròn)
   */
  private ensureCelebrityStandee(
    standeeKey: string,
    sourceKey: string,
    borderColor: string,
    glowColor: string
  ) {
    if (this.textures.exists(standeeKey)) return;
    if (!this.textures.exists(sourceKey)) return;

    try {
      const sourceImg = this.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
      if (!sourceImg || !sourceImg.width || !sourceImg.height) return;

      const imgW = sourceImg.width;
      const imgH = sourceImg.height;

      // 1. Kiểm tra xem ảnh có trong suốt (ảnh đã xóa nền / transparent PNG) không
      let isTransparent = false;
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 16;
        testCanvas.height = 16;
        const testCtx = testCanvas.getContext('2d');
        if (testCtx) {
          testCtx.drawImage(sourceImg, 0, 0, 16, 16);
          const data = testCtx.getImageData(0, 0, 16, 16).data;
          // Kiểm tra 4 góc: nếu có góc nào alpha < 120 thì đây là ảnh đã xóa nền
          const corners = [0, 15 * 4, 15 * 16 * 4, (15 * 16 + 15) * 4];
          isTransparent = corners.some((idx) => data[idx + 3] < 120);
        }
      } catch (e) {
        isTransparent = true;
      }

      // Kích thước canvas vẽ standee (độ phân giải cao 2x cho màn hình Retina)
      const targetH = 130;
      const aspect = imgW / imgH;
      const targetW = Math.round(targetH * Math.min(Math.max(aspect, 0.45), 1.3));

      const padX = 10;
      const padY = 8;
      const canvasW = targetW + padX * 2;
      const canvasH = targetH + padY * 2;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (isTransparent) {
        // ========================================================
        // ẢNH ĐÃ XÓA NỀN (TRANSPARENT PNG STANDALONE STANDEE):
        // KHÔNG CẮT TRÒN! Giữ nguyên vẹn 100% silhouette nhân vật!
        // ========================================================

        // 1. Lớp viền hào quang phát sáng nhẹ theo màu phân khu quanh bóng người
        ctx.save();
        ctx.shadowColor = glowColor || borderColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.drawImage(sourceImg, padX, padY, targetW, targetH);
        ctx.restore();

        // 2. Vẽ lại ảnh sắc nét lên trên
        ctx.drawImage(sourceImg, padX, padY, targetW, targetH);
      } else {
        // ========================================================
        // ẢNH CHƯA XÓA NỀN (ẢNH VUÔNG / CHỮ NHẬT):
        // Bo góc vòm standee nghệ thuật (thay vì cắt tròn)
        // ========================================================
        ctx.save();
        const archR = 14;
        ctx.beginPath();
        ctx.moveTo(padX + archR, padY);
        ctx.lineTo(padX + targetW - archR, padY);
        ctx.quadraticCurveTo(padX + targetW, padY, padX + targetW, padY + archR);
        ctx.lineTo(padX + targetW, padY + targetH - 6);
        ctx.quadraticCurveTo(padX + targetW, padY + targetH, padX + targetW - 6, padY + targetH);
        ctx.lineTo(padX + 6, padY + targetH);
        ctx.quadraticCurveTo(padX, padY + targetH, padX, padY + targetH - 6);
        ctx.lineTo(padX, padY + archR);
        ctx.quadraticCurveTo(padX, padY, padX + archR, padY);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(sourceImg, padX, padY, targetW, targetH);
        ctx.restore();

        // Viền thẻ standee
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(padX + archR, padY);
        ctx.lineTo(padX + targetW - archR, padY);
        ctx.quadraticCurveTo(padX + targetW, padY, padX + targetW, padY + archR);
        ctx.lineTo(padX + targetW, padY + targetH - 6);
        ctx.quadraticCurveTo(padX + targetW, padY + targetH, padX + targetW - 6, padY + targetH);
        ctx.lineTo(padX + 6, padY + targetH);
        ctx.quadraticCurveTo(padX, padY + targetH, padX, padY + targetH - 6);
        ctx.lineTo(padX, padY + archR);
        ctx.quadraticCurveTo(padX, padY, padX + archR, padY);
        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = borderColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
      }

      this.textures.addCanvas(standeeKey, canvas);
    } catch (e) {
      console.warn('Could not generate standee for', standeeKey, e);
    }
  }

  // ============================================================
  // CẤU HÌNH 10 NPC PHÂN NHÓM THEO 4 PHÂN KHU ĐỐI KHÁNG
  // ============================================================
  private setupGroupedNPCs(clearedBadges: string[], rpgDecisions?: Record<string, any>) {
    const configs: NPCNode[] = [
      // --------------------------------------------------------
      // PHÂN KHU 1: NHÀ HÁT NGHỆ THUẬT & SHOWBIZ (CHƯƠNG 1)
      // --------------------------------------------------------
      {
        id: 'npc_jack_j97',
        name: 'Jack (J97)',
        role: 'Nghệ Sĩ Sáng Tác',
        dialogue: npcsData.find((n) => n.id === 'npc_jack_j97')?.dialogue || 'Tôi muốn được tự do hát các ca khúc mình sáng tác!',
        x: 95,
        y: 200, // Bậc thềm trước cửa Nhà hát Opera bên trái
        scenarioId: 'scenario_jack_j97',
        spriteIndex: 0,
        facing: 'right', // Nhìn sang Producer K-ICM
        chapter: 1,
        districtTitle: 'Nhà Hát Nghệ Thuật & Showbiz',
        portraitKey: 'npc_jack',
        borderColor: '#c084fc',
        glowColor: '#a855f7',
      },
      {
        id: 'npc_nathan_lee_copyright',
        name: 'K-ICM',
        role: 'Producer',
        dialogue: npcsData.find((n) => n.id === 'npc_nathan_lee_copyright')?.dialogue || 'Tôi tạo nên linh hồn bản phối và đệm đàn cho các hit triệu view, công sức lao động của Producer có được công nhận xứng đáng?',
        x: 205,
        y: 200, // Bậc thềm trước cửa Nhà hát Opera bên phải
        scenarioId: 'scenario_nathan_lee_copyright',
        spriteIndex: 4,
        facing: 'left', // Đối diện trực tiếp Ca sĩ Jack
        chapter: 1,
        districtTitle: 'Nhà Hát Nghệ Thuật & Showbiz',
        portraitKey: 'npc_kicm',
        borderColor: '#38bdf8',
        glowColor: '#0ea5e9',
      },

      // --------------------------------------------------------
      // PHÂN KHU 2: XƯỞNG XE ĐIỆN & RẠP PHIM (CHƯƠNG 1)
      // --------------------------------------------------------
      {
        id: 'npc_vinfast_pham_nhat_vuong',
        name: 'Phạm Nhật Vượng',
        role: 'Chủ Tịch VinFast',
        dialogue: npcsData.find((n) => n.id === 'npc_vinfast_pham_nhat_vuong')?.dialogue || 'Muốn tự chủ công nghiệp xanh, quốc gia phải có doanh nghiệp tiên phong!',
        x: 640,
        y: 215, // Trước xưởng sản xuất ô tô điện xanh
        scenarioId: 'scenario_vinfast_pham_nhat_vuong',
        spriteIndex: 2,
        facing: 'down',
        chapter: 1,
        districtTitle: 'Xưởng Xe Điện & Rạp Phim',
        portraitKey: 'npc_pham_nhat_vuong',
        borderColor: '#34d399',
        glowColor: '#10b981',
      },
      {
        id: 'npc_tran_thanh_cinema',
        name: 'Đạo Diễn Trấn Thành',
        role: 'Vua Phòng Vé 1.500 Tỷ',
        dialogue: npcsData.find((n) => n.id === 'npc_tran_thanh_cinema')?.dialogue || 'Khán giả muốn xem thì rạp xếp nhiều suất, đó là quy luật thị trường!',
        x: 810,
        y: 225, // Trên thảm đỏ trước cửa Rạp chiếu phim Cinema
        scenarioId: 'scenario_tran_thanh_cinema',
        spriteIndex: 3,
        facing: 'down',
        chapter: 1,
        districtTitle: 'Xưởng Xe Điện & Rạp Phim',
        portraitKey: 'npc_tran_thanh',
        borderColor: '#f43f5e',
        glowColor: '#e11d48',
      },

      // --------------------------------------------------------
      // PHÂN KHU 3: STUDIO LIVESTREAM & SAO KÊ (CHƯƠNG 2)
      // --------------------------------------------------------
      {
        id: 'npc_ceo_phuong_hang',
        name: 'CEO Phương Hằng',
        role: 'Bà Chủ Đại Nam',
        dialogue: npcsData.find((n) => n.id === 'npc_ceo_phuong_hang')?.dialogue || 'Tiền từ thiện của nhân dân phải minh bạch sao kê từng đồng một!',
        x: 105,
        y: 415, // Bên bàn phát sóng và đèn ring light studio
        scenarioId: 'scenario_ceo_phuong_hang',
        spriteIndex: 0,
        facing: 'right', // Nhìn sang Hoài Linh
        chapter: 2,
        districtTitle: 'Studio Livestream & Sao Kê',
        portraitKey: 'npc_phuong_hang',
        borderColor: '#fb923c',
        glowColor: '#f97316',
      },
      {
        id: 'npc_hoai_linh_charity',
        name: 'NS Hoài Linh',
        role: 'Cứu Trợ 14 Tỷ Lũ Lụt',
        dialogue: npcsData.find((n) => n.id === 'npc_hoai_linh_charity')?.dialogue || 'Tôi nhận lỗi chậm trễ do dịch bệnh và sức khỏe, không hề biển thủ!',
        x: 315,
        y: 465, // Trước sân vườn biệt thự bên cạnh studio
        scenarioId: 'scenario_hoai_linh_charity',
        spriteIndex: 1,
        facing: 'left', // Đối thoại với Phương Hằng
        chapter: 2,
        districtTitle: 'Studio Livestream & Sao Kê',
        portraitKey: 'npc_hoai_linh',
        borderColor: '#fde047',
        glowColor: '#eab308',
      },

      // --------------------------------------------------------
      // PHÂN KHU 4: TÒA ÁN & TRẠI TẠM GIAM ĐẠI ÁN KERA (CHƯƠNG 2)
      // --------------------------------------------------------
      {
        id: 'npc_quang_linh_kera',
        name: 'Quang Linh Vlogs',
        role: 'Mega-Live Kẹo Kera',
        dialogue: npcsData.find((n) => n.id === 'npc_quang_linh_kera')?.dialogue || 'Tôi livestream bán kẹo Kera chốt trăm ngàn đơn, không ngờ chất lượng sản phẩm bị tố mập mờ!',
        x: 830,
        y: 420, // Trước bậc thềm Tòa án
        scenarioId: 'scenario_quang_linh_kera',
        spriteIndex: 2,
        facing: 'right', // Nhìn sang Thùy Tiên
        chapter: 2,
        districtTitle: 'Tòa Án & Trại Tạm Giam',
        portraitKey: 'npc_quang_linh',
        borderColor: '#38bdf8',
        glowColor: '#0ea5e9',
      },
      {
        id: 'npc_thuy_tien_kera',
        name: 'Hoa Hậu Thùy Tiên',
        role: 'Đại Sứ Kẹo Kera',
        dialogue: npcsData.find((n) => n.id === 'npc_thuy_tien_kera')?.dialogue || 'Tôi là đại sứ hình ảnh cho kẹo Kera, nhưng đứng trước câu hỏi về trách nhiệm liên đới kiểm định chất lượng!',
        x: 735,
        y: 445, // Trước bậc thềm Tòa án
        scenarioId: 'scenario_thuy_tien_kera',
        spriteIndex: 4,
        facing: 'left', // Nhìn sang Quang Linh
        chapter: 2,
        districtTitle: 'Tòa Án & Trại Tạm Giam',
        portraitKey: 'npc_thuy_tien',
        borderColor: '#10b981',
        glowColor: '#059669',
      },
      {
        id: 'npc_cuc_thue_so_boss',
        name: 'Cục Trưởng Thanh Tra',
        role: 'Trùm Cuối - Đại Án Kera',
        dialogue: npcsData.find((n) => n.id === 'npc_cuc_thue_so_boss')?.dialogue || 'Đại án Kẹo Kera và thuế mega-live: Không có vùng cấm cho hàng kém chất lượng và trốn thuế!',
        x: 575,
        y: 450, // Trước cổng Nhà tù / Trại tạm giam có chòi canh
        scenarioId: 'scenario_cuc_thue_so_boss',
        spriteIndex: 5,
        facing: 'left', // Đứng nhìn toàn cảnh phân khu
        chapter: 2,
        districtTitle: 'Tòa Án & Trại Tạm Giam',
        portraitKey: 'npc_cuc_thue',
        borderColor: '#ef4444',
        glowColor: '#dc2626',
      },
    ];

    configs.forEach((npc, index) => {
      const isCleared = clearedBadges.includes(npc.scenarioId) || !!rpgDecisions?.[npc.scenarioId];
      const container = this.add.container(npc.x, npc.y).setDepth(15);

      const standeeKey = `standee_${npc.id}`;
      if (npc.portraitKey && this.textures.exists(npc.portraitKey)) {
        this.ensureCelebrityStandee(
          standeeKey,
          npc.portraitKey,
          npc.borderColor || '#fbbf24',
          npc.glowColor || '#f59e0b'
        );
      }

      const hasCelebrityStandee = this.textures.exists(standeeKey);
      npc.isCelebrityToken = hasCelebrityStandee;

      // Tính kích thước hiển thị cân xứng theo tỉ lệ ảnh
      const displayH = 50;
      let displayW = 38;
      if (hasCelebrityStandee) {
        const tex = this.textures.get(standeeKey);
        const sourceImage = tex.getSourceImage() as HTMLCanvasElement;
        if (sourceImage && sourceImage.height > 0) {
          const ratio = sourceImage.width / sourceImage.height;
          displayW = Math.round(displayH * ratio);
        }
      }

      // Bóng đổ dưới chân nhân vật
      const shadowW = hasCelebrityStandee ? Math.max(displayW * 0.75, 24) : 20;
      const shadow = this.add
        .ellipse(0, 18, shadowW, hasCelebrityStandee ? 9 : 8, 0x000000, 0.45)
        .setOrigin(0.5);

      let sprite: Phaser.GameObjects.Image;
      if (hasCelebrityStandee) {
        // Chân nhân vật chạm đất tại y = 18, đỉnh đầu vươn lên, kích thước cố định ổn định
        sprite = this.add
          .image(0, 18, standeeKey)
          .setDisplaySize(displayW, displayH)
          .setOrigin(0.5, 1);
      } else {
        sprite = this.add
          .image(0, 0, `char_${npc.spriteIndex}_${npc.facing}`)
          .setScale(2)
          .setOrigin(0.5);
      }

      // Bảng tên đặt ngay trên đỉnh đầu standee
      const nameTagW = 86;
      const nameTagH = 20;
      const nameTag = this.add.container(0, hasCelebrityStandee ? -42 : -28);

      const tagBg = this.add.graphics();
      tagBg.fillStyle(0x080c16, 0.92);
      tagBg.fillRoundedRect(-nameTagW / 2, -nameTagH / 2, nameTagW, nameTagH, 4);
      tagBg.lineStyle(1, npc.chapter === 1 ? 0xa855f7 : 0x3b82f6, 0.8);
      tagBg.strokeRoundedRect(-nameTagW / 2, -nameTagH / 2, nameTagW, nameTagH, 4);

      const nameText = this.add
        .text(0, -4, npc.name, {
          fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
          fontSize: '7px',
          color: '#ffffff',
          fontStyle: 'bold',
          resolution: 2,
        })
        .setOrigin(0.5);

      const roleText = this.add
        .text(0, 4, npc.role, {
          fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
          fontSize: '6px',
          color: npc.id === 'npc_cuc_thue_so_boss' ? '#ef4444' : '#fbbf24',
          resolution: 2,
        })
        .setOrigin(0.5);

      nameTag.add([tagBg, nameText, roleText]);

      // Khởi tạo container huy hiệu kết cục trên đầu NPC
      const statusBadge = this.add.container(0, hasCelebrityStandee ? -59 : -45);

      // Bong bóng "!" nhấp nháy cho NPC chưa giải quyết
      const exclamation = this.add.container(0, hasCelebrityStandee ? -58 : -44);
      const exclBg = this.add.graphics();
      exclBg.fillStyle(npc.id === 'npc_cuc_thue_so_boss' ? 0xef4444 : 0xf59e0b, 1);
      exclBg.fillRoundedRect(-7, -7, 14, 14, 3);
      const exclText = this.add
        .text(0, 0, npc.id === 'npc_cuc_thue_so_boss' ? '👑' : '!', {
          fontFamily: 'Be Vietnam Pro',
          fontSize: '8px',
          color: '#080c16',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      exclamation.add([exclBg, exclText]);

      this.tweens.add({
        targets: exclamation,
        y: (hasCelebrityStandee ? -58 : -44) - 4,
        yoyo: true,
        repeat: -1,
        duration: 650,
        ease: 'Sine.easeInOut',
      });

      container.add([shadow, sprite, nameTag, statusBadge, exclamation]);

      // Click vào NPC để tương tác
      container
        .setSize(hasCelebrityStandee ? Math.max(displayW, 36) : 36, hasCelebrityStandee ? 54 : 48)
        .setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => this.interactWithNPC(npc));

      npc.sprite = sprite;
      npc.container = container;
      npc.statusBadge = statusBadge;
      npc.exclamation = exclamation;

      // Cập nhật nhãn kết cục chính xác của từng nhân vật
      this.updateNPCBadge(npc, rpgDecisions?.[npc.scenarioId], isCleared);

      this.npcs.push(npc);
    });
  }

  // ============================================================
  // TẠO NHÂN VẬT NGƯỜI CHƠI
  // ============================================================
  private createDustTexture() {
    if (this.textures.exists('rpg-dust')) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xd8d2c4, 1);
    g.fillRect(0, 0, 3, 3);
    g.generateTexture('rpg-dust', 3, 3);
    g.destroy();
  }

  private createPlayer(x: number, y: number, name: string) {
    this.dust = this.add.particles(0, 0, 'rpg-dust', {
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

    this.playerNameText = this.add
      .text(0, -22, name, {
        fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
        fontSize: '7px',
        color: '#fde68a',
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0.5);
    this.playerNameText.setStroke('#080c16', 3);

    this.player.add([this.playerShadow, this.playerSprite, this.playerNameText]);
  }

  // ============================================================
  // BONG BÓNG TƯƠNG TÁC PHÍM BẤM
  // ============================================================
  private createPrompt() {
    this.prompt = this.add.container(0, 0).setDepth(30).setVisible(false);

    const panelH = 17;
    const keycapW = 32;
    const panelW = 150;

    this.promptLabel = this.add
      .text(0, 0, '', {
        fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
        fontSize: '7px',
        color: '#f8fafc',
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0, 0.5);

    const panel = this.add.graphics();
    panel.fillStyle(0x080c16, 0.95);
    panel.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
    panel.lineStyle(1, 0xfde68a, 1);
    panel.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
    panel.fillStyle(0x080c16, 0.95);
    panel.fillTriangle(-4, -panelH / 2, 4, -panelH / 2, 0, -panelH / 2 - 4);

    const keycap = this.add.graphics();
    keycap.fillStyle(0xfde68a, 1);
    keycap.fillRoundedRect(-panelW / 2 + 5, -5, keycapW, 10, 2);

    const keyText = this.add
      .text(-panelW / 2 + 5 + keycapW / 2, 0, 'SPACE', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '5.5px',
        color: '#080c16',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.promptLabel.setX(-panelW / 2 + keycapW + 10);

    const hit = this.add
      .zone(0, 0, panelW, panelH)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      if (this.activeNearbyNPC && !this.isDialogueOpen) {
        this.interactWithNPC(this.activeNearbyNPC);
      }
    });

    this.prompt.add([panel, keycap, keyText, this.promptLabel, hit]);
  }

  // ============================================================
  // UPDATE VÒNG LẶP GAME & DI CHUYỂN
  // ============================================================
  update(_time: number, delta: number) {
    if (!this.player) return;

    // Khi đang trong màn hình trò chuyện, cố định nhân vật và dừng di chuyển
    if (this.isDialogueOpen) {
      this.playerSprite.setTexture(`char_${this.playerSkin}_${this.lastFacing}`);
      this.playerSprite.setY(0);
      this.playerShadow.setScale(1, 1);
      this.dust.stop();
      this.prompt.setVisible(false);
      return;
    }

    const speed = 3.0;
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

    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    const isMoving = dx !== 0 || dy !== 0;

    if (isMoving) {
      this.lastFacing = facing;

      this.player.x = Phaser.Math.Clamp(
        this.player.x + dx,
        WALK_MIN_X,
        WALK_MAX_X
      );
      this.player.y = Phaser.Math.Clamp(this.player.y + dy, WALK_MIN_Y, WALK_MAX_Y);

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

    // Kiểm tra khoảng cách tới 10 NPC
    let closestNPC: NPCNode | null = null;
    let minDist = INTERACT_RADIUS;

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < minDist) {
        minDist = dist;
        closestNPC = npc;
      }
    }

    if (closestNPC !== this.activeNearbyNPC) {
      this.activeNearbyNPC = closestNPC;

      if (closestNPC) {
        this.promptLabel.setText(`Đối thoại với ${closestNPC.name}`);
        this.prompt.setScale(0.8).setAlpha(0);
        this.tweens.add({
          targets: this.prompt,
          scale: 1,
          alpha: 1,
          duration: 160,
          ease: 'Back.easeOut',
        });

        // NPC phản hồi khi người chơi tới gần: chỉ quay mặt về phía người chơi, không co giãn kích thước
        if (closestNPC.sprite) {
          if (closestNPC.isCelebrityToken) {
            if (this.player.x < closestNPC.x - 4) {
              closestNPC.sprite.setFlipX(true);
            } else if (this.player.x > closestNPC.x + 4) {
              closestNPC.sprite.setFlipX(false);
            }
          } else {
            if (this.player.x < closestNPC.x - 8) {
              closestNPC.sprite.setTexture(`char_${closestNPC.spriteIndex}_left`);
            } else if (this.player.x > closestNPC.x + 8) {
              closestNPC.sprite.setTexture(`char_${closestNPC.spriteIndex}_right`);
            } else if (this.player.y < closestNPC.y) {
              closestNPC.sprite.setTexture(`char_${closestNPC.spriteIndex}_up`);
            } else {
              closestNPC.sprite.setTexture(`char_${closestNPC.spriteIndex}_down`);
            }
          }
        }
      }
      this.prompt.setVisible(!!closestNPC);
    }

    if (this.activeNearbyNPC) {
      if (this.activeNearbyNPC.isCelebrityToken && this.activeNearbyNPC.sprite) {
        if (this.player.x < this.activeNearbyNPC.x - 4) {
          this.activeNearbyNPC.sprite.setFlipX(true);
        } else if (this.player.x > this.activeNearbyNPC.x + 4) {
          this.activeNearbyNPC.sprite.setFlipX(false);
        }
      }

      this.prompt.setPosition(this.player.x, this.player.y + 34);

      if (
        (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) ||
        (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.ENTER))
      ) {
        this.interactWithNPC(this.activeNearbyNPC);
      }
    }
  }

  private interactWithNPC(npc: NPCNode) {
    if (this.isDialogueOpen) return;
    this.isDialogueOpen = true;

    // Hiệu ứng nhún nhảy (jump bounce) của nhân vật khi mở hội thoại
    if (npc.sprite) {
      this.tweens.add({
        targets: npc.sprite,
        y: npc.isCelebrityToken ? 11 : -6,
        duration: 120,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    // Dừng bụi và ẩn prompt
    this.dust.stop();
    this.prompt.setVisible(false);
    this.playerSprite.setTexture(`char_${this.playerSkin}_${this.lastFacing}`);

    // NPC quay mặt nhìn về phía người chơi
    if (npc.sprite) {
      if (npc.isCelebrityToken) {
        if (this.player.x < npc.x - 4) {
          npc.sprite.setFlipX(true);
        } else if (this.player.x > npc.x + 4) {
          npc.sprite.setFlipX(false);
        }
      } else {
        if (this.player.x < npc.x - 8) {
          npc.sprite.setTexture(`char_${npc.spriteIndex}_left`);
        } else if (this.player.x > npc.x + 8) {
          npc.sprite.setTexture(`char_${npc.spriteIndex}_right`);
        } else if (this.player.y < npc.y) {
          npc.sprite.setTexture(`char_${npc.spriteIndex}_up`);
        } else {
          npc.sprite.setTexture(`char_${npc.spriteIndex}_down`);
        }
      }
    }

    EventBus.emit('open-rpg-dialogue', {
      npcId: npc.id,
      npcName: npc.name,
      role: npc.role,
      scenarioId: npc.scenarioId,
    });
  }

  /**
   * Cập nhật nhãn kết cục trực tiếp trên đầu NPC dựa theo phán quyết đã đưa ra
   */
  private updateNPCBadge(npc: NPCNode, decision?: RpgDecision, isClearedFallback?: boolean) {
    if (!npc.statusBadge) return;

    const hasDecision = !!decision;
    const isCleared = hasDecision || !!isClearedFallback;

    if (!isCleared) {
      npc.statusBadge.setVisible(false);
      npc.exclamation?.setVisible(true);
      return;
    }

    npc.exclamation?.setVisible(false);
    npc.statusBadge.setVisible(true);
    npc.statusBadge.removeAll(true);

    const branch = RPG_BRANCHES_DATA[npc.scenarioId];
    const ending = decision?.endingId ? branch?.endings?.[decision.endingId] : undefined;

    const label = ending?.badgeLabel || decision?.endingTitle || '✓ ĐÃ PHÁN QUYẾT';
    const category = ending?.category || decision?.category || 'socialist';

    let bgColor = 0x064e3b;
    let borderColor = 0x10b981;
    let textColor = '#6ee7b7';

    if (category === 'capitalist') {
      bgColor = 0x450a0a;
      borderColor = 0xf43f5e;
      textColor = '#fca5a5';
    } else if (category === 'compromise') {
      bgColor = 0x172554;
      borderColor = 0x3b82f6;
      textColor = '#93c5fd';
    } else if (category === 'bureaucratic') {
      bgColor = 0x451a03;
      borderColor = 0xf59e0b;
      textColor = '#fde68a';
    }

    const badgeText = this.add
      .text(0, 0, label, {
        fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
        fontSize: '6px',
        color: textColor,
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0.5);

    const padX = 7;
    const badgeW = Math.max(badgeText.width + padX * 2, 56);
    const badgeH = 14;

    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(bgColor, 0.95);
    badgeBg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 3);
    badgeBg.lineStyle(1, borderColor, 1);
    badgeBg.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 3);

    npc.statusBadge.add([badgeBg, badgeText]);
  }

  /**
   * Khôi phục camera và cập nhật huy hiệu khi người chơi thoát khỏi màn hình đối thoại
   */
  private handleDialogueClosed = () => {
    this.isDialogueOpen = false;

    // Cập nhật lại huy hiệu kết cục cho toàn bộ NPC sau khi đóng modal đối thoại
    const progress = loadProgress();
    for (const npc of this.npcs) {
      const decision = progress.rpgDecisions?.[npc.scenarioId];
      const isCleared = progress.badges.includes(npc.scenarioId);
      this.updateNPCBadge(npc, decision, isCleared);
    }

    // Khôi phục tỷ lệ camera chuẩn của thế giới Overworld
    this.applyCameraZoom();

    // Khôi phục camera bám mượt theo người chơi
    if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }
  };
}
