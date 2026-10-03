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

    const handleChangeScene = (targetScene: string) => {
      if (!gameRef.current) return;
      const sceneManager = gameRef.current.scene;

      // Blur bất kỳ nút HTML nào đang giữ focus để phím điều khiển ăn ngay vào Canvas
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      gameRef.current.canvas?.focus?.();

      // Dừng tất cả scene đang chạy khác targetScene để tránh xung đột
      const activeScenes = sceneManager.getScenes(true);
      for (const s of activeScenes) {
        if (s.scene.key !== targetScene) {
          sceneManager.stop(s.scene.key);
        }
      }

      // Khởi động scene đích nếu chưa chạy
      if (!sceneManager.isActive(targetScene)) {
        sceneManager.start(targetScene);
      }
    };

    EventBus.on('current-scene-ready', handleSceneReady);
    EventBus.on('change-scene', handleChangeScene);

    return () => {
      EventBus.removeListener('current-scene-ready', handleSceneReady);
      EventBus.removeListener('change-scene', handleChangeScene);
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
