import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // 1. Tải texture bản đồ thành phố nền & Đấu Trường Thể Chế riêng biệt
    this.load.image('city-base', 'assets/maps/city-base.png');
    this.load.image('arena-base', 'assets/maps/arena-map.png');

    // 2. Tải spritesheet thành phố từ Kenney Modern City
    this.load.image(
      'city-tiles',
      'assets/kenney/modern-city/Spritesheet/roguelikeCity_magenta.png'
    );

    // 3. Tải các sprite mây pixel phục vụ che phủ khu khóa và chuyển cảnh
    this.load.image('cloud_large', 'assets/clouds/cloud_large.png');
    this.load.image('cloud_medium', 'assets/clouds/cloud_medium.png');
    this.load.image('cloud_small', 'assets/clouds/cloud_small.png');

    // 4. Tải các sprite nhân vật (6 nhân vật với 4 hướng di chuyển từ Kenney RPG Urban)
    for (let i = 0; i < 6; i++) {
      const row = i * 3;
      const left = (row * 27 + 23).toString().padStart(4, '0');
      const down = (row * 27 + 24).toString().padStart(4, '0');
      const up = (row * 27 + 25).toString().padStart(4, '0');
      const right = (row * 27 + 26).toString().padStart(4, '0');
      const leftWalk = ((row + 1) * 27 + 23).toString().padStart(4, '0');
      const downWalk = ((row + 1) * 27 + 24).toString().padStart(4, '0');
      const upWalk = ((row + 1) * 27 + 25).toString().padStart(4, '0');
      const rightWalk = ((row + 1) * 27 + 26).toString().padStart(4, '0');

      this.load.image(`char_${i}_down`, `assets/kenney/rpg-urban/Tiles/tile_${down}.png`);
      this.load.image(`char_${i}_up`, `assets/kenney/rpg-urban/Tiles/tile_${up}.png`);
      this.load.image(`char_${i}_left`, `assets/kenney/rpg-urban/Tiles/tile_${left}.png`);
      this.load.image(`char_${i}_right`, `assets/kenney/rpg-urban/Tiles/tile_${right}.png`);
      this.load.image(`char_${i}_walk_down`, `assets/kenney/rpg-urban/Tiles/tile_${downWalk}.png`);
      this.load.image(`char_${i}_walk_up`, `assets/kenney/rpg-urban/Tiles/tile_${upWalk}.png`);
      this.load.image(`char_${i}_walk_left`, `assets/kenney/rpg-urban/Tiles/tile_${leftWalk}.png`);
      this.load.image(`char_${i}_walk_right`, `assets/kenney/rpg-urban/Tiles/tile_${rightWalk}.png`);
    }

    // 5. Tải ảnh chân dung người nổi tiếng ngoài đời thật cho NPC trên bản đồ
    this.load.image('npc_jack', 'assets/characters/jack.png');
    this.load.image('npc_icm', 'assets/characters/icm.png');
    this.load.image('npc_kicm', 'assets/characters/kicm.png');
    this.load.image('npc_nathan_lee', 'assets/characters/kicm.png');
    this.load.image('npc_pham_nhat_vuong', 'assets/characters/pham_nhat_vuong.png');
    this.load.image('npc_tran_thanh', 'assets/characters/tran_thanh.png');
    this.load.image('npc_phuong_hang', 'assets/characters/phuong_hang.png');
    this.load.image('npc_hoai_linh', 'assets/characters/hoai_linh.png');
    this.load.image('npc_quang_linh', 'assets/characters/quang_linh.png');
    this.load.image('npc_thuy_tien', 'assets/characters/thuy_tien.png');
    this.load.image('npc_cuc_thue', 'assets/characters/cuc_thue.png');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    this.scene.start('HubScene');
  }
}
