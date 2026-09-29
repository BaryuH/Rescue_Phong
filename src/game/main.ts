import { AUTO, Game, Scale } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HubScene } from './scenes/HubScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 576,
  parent: 'game-container',
  backgroundColor: '#0a0a0f',
  pixelArt: true,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [BootScene, HubScene, OverworldScene, BattleScene],
};

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};
