import React, { useEffect, useRef } from 'react';
import { Game } from 'phaser';
import { StartGame } from './main';
import { EventBus } from './EventBus';

import { BootScene } from './scenes/BootScene';

export interface PhaserGameRef {
  game: Game | null;
  scene: Phaser.Scene | null;
}

interface Props {
  currentScene?: string;
  paused?: boolean;
  currentActiveScene?: (scene: Phaser.Scene) => void;
}

export const PhaserGame: React.FC<Props> = ({ currentScene, paused, currentActiveScene }) => {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (currentScene) {
      BootScene.initialScene = currentScene;
    }

    if (!gameRef.current) {
      gameRef.current = StartGame('game-container');
    }

    const handleSceneReady = (scene: Phaser.Scene) => {
      if (currentActiveScene) {
        currentActiveScene(scene);
      }
    };

    const handleChangeScene = (targetScene: string) => {
      BootScene.initialScene = targetScene;
      if (!gameRef.current) return;
      const sceneManager = gameRef.current.scene;

      // Blur bất kỳ nút HTML nào đang giữ focus để phím điều khiển ăn ngay vào Canvas
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      gameRef.current.canvas?.focus?.();

      // Nếu BootScene vẫn đang chạy thì BootScene.create() sẽ tự mở targetScene
      if (sceneManager.isActive('BootScene')) {
        return;
      }

      // Dừng tất cả scene đang chạy khác targetScene để tránh xung đột
      const activeScenes = sceneManager.getScenes(true);
      for (const s of activeScenes) {
        if (s.scene.key !== targetScene && s.scene.key !== 'BootScene') {
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

  // Đồng bộ scene đích khi currentScene prop thay đổi
  useEffect(() => {
    if (!currentScene) return;
    BootScene.initialScene = currentScene;

    if (!gameRef.current) return;
    const sceneManager = gameRef.current.scene;

    if (sceneManager.isActive('BootScene')) {
      return;
    }

    const activeScenes = sceneManager.getScenes(true);
    let isAlreadyActive = false;
    for (const s of activeScenes) {
      if (s.scene.key === currentScene) {
        isAlreadyActive = true;
      } else if (s.scene.key !== 'BootScene') {
        sceneManager.stop(s.scene.key);
      }
    }

    if (!isAlreadyActive) {
      sceneManager.start(currentScene);
    }
  }, [currentScene]);

  // Khi paused (chuyển sang Thư viện / Thử thách), vô hiệu hóa toàn bộ input và tạm dừng scene
  useEffect(() => {
    if (!gameRef.current) return;
    const game = gameRef.current;
    if (paused) {
      if (game.input) {
        game.input.enabled = false;
        if (game.input.keyboard) game.input.keyboard.enabled = false;
        if (game.input.mouse) game.input.mouse.enabled = false;
        if (game.input.touch) game.input.touch.enabled = false;
      }
      game.scene.getScenes(true).forEach((s) => {
        if (s.input) {
          s.input.enabled = false;
          s.input.keyboard?.resetKeys();
        }
        if (s.scene.isActive()) {
          s.scene.pause();
        }
      });
    } else {
      if (game.input) {
        game.input.enabled = true;
        if (game.input.keyboard) game.input.keyboard.enabled = true;
        if (game.input.mouse) game.input.mouse.enabled = true;
        if (game.input.touch) game.input.touch.enabled = true;
      }
      game.scene.getScenes(false).forEach((s) => {
        if (s.scene.isPaused()) {
          s.scene.resume();
        }
        if (s.input) {
          s.input.enabled = true;
          s.input.keyboard?.resetKeys();
        }
      });
      game.canvas?.focus?.();
    }
  }, [paused]);

  return (
    <div
      id="game-container"
      className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-950"
    />
  );
};
