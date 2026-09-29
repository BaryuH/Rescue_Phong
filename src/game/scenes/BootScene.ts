import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Tải texture bản đồ thành phố nền
    this.load.image('city-base', 'assets/maps/city-base.png');

    // Tải spritesheet thành phố từ Kenney Modern City
    this.load.image(
      'city-tiles',
      'assets/kenney/modern-city/Spritesheet/roguelikeCity_magenta.png'
    );

    // Tải spritesheet nhân vật từ Kenney RPG Urban Pack
    this.load.spritesheet(
      'urban-characters',
      'assets/kenney/rpg-urban/Tilemap/tilemap_packed.png',
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    // Tải các sprite mây pixel phục vụ che phủ khu khóa và chuyển cảnh
    this.load.image('cloud_large', 'assets/clouds/cloud_large.png');
    this.load.image('cloud_medium', 'assets/clouds/cloud_medium.png');
    this.load.image('cloud_small', 'assets/clouds/cloud_small.png');
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    this.scene.start('HubScene');
  }
}
