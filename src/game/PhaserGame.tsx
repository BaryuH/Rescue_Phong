import React, { useEffect, useRef } from 'react';
import { Game } from 'phaser';
import { StartGame } from './main';
import { EventBus } from './EventBus';

export interface PhaserGameRef {
  game: Game | null;
  scene: Phaser.Scene | null;
}

interface Props {
  currentActiveScene?: (scene: Phaser.Scene) => void;
}

export const PhaserGame: React.FC<Props> = ({ currentActiveScene }) => {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = StartGame('game-container');
    }

    const handleSceneReady = (scene: Phaser.Scene) => {
      if (currentActiveScene) {
        currentActiveScene(scene);
      }
    };

    EventBus.on('current-scene-ready', handleSceneReady);

    return () => {
      EventBus.removeListener('current-scene-ready', handleSceneReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [currentActiveScene]);

  return (
    <div
      id="game-container"
      className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-950"
    />
  );
};
