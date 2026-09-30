import { AUTO, Game, Scale } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HubScene } from './scenes/HubScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';

/**
 * Canvas luôn phủ kín khung cha (Scale.RESIZE), còn thế giới pixel 950x352
 * được camera zoom lên cho vừa màn hình rồi bám theo nhân vật.
 * => Không còn dải đen thừa hai bên trên/dưới như bản FIT trước đây.
 */
export const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#070a12',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Scale.RESIZE,
    autoCenter: Scale.NO_CENTER,
    width: '100%',
    height: '100%',
  },
  scene: [BootScene, HubScene, OverworldScene, BattleScene],
};

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};
