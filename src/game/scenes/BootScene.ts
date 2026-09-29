import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
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
  }

  create() {
    EventBus.emit('current-scene-ready', this);
    this.scene.start('HubScene');
  }
}
