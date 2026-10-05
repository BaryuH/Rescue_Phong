import { useState, useEffect } from 'react';
import { GameProgress, INITIAL_PROGRESS } from './progress';
import { EventBus } from '../game/EventBus';

const SAVE_KEY = 'rescue_phong_save_v1';
const SAVE_EVENT = 'rescue_phong_progress_changed';

/**
 * Đọc dữ liệu tiến độ từ LocalStorage
 */
export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...INITIAL_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      appearance: {
        ...INITIAL_PROGRESS.appearance,
        ...(parsed.appearance || {}),
      },
      settings: {
        ...INITIAL_PROGRESS.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (error) {
    console.warn('Lỗi khi đọc file save từ localStorage:', error);
    return { ...INITIAL_PROGRESS };
  }
}

/**
 * Lưu tiến độ vào LocalStorage và thông báo cho các component lắng nghe
 */
export function saveProgress(updates: Partial<GameProgress>): GameProgress {
  try {
    const current = loadProgress();
    const updated: GameProgress = {
      ...current,
      ...updates,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SAVE_EVENT, { detail: updated }));
    if (
      updates.playerName !== undefined ||
      updates.playerSkin !== undefined ||
      updates.appearance !== undefined
    ) {
      EventBus.emit('player-updated', {
        playerName: updated.playerName,
        playerSkin: updated.playerSkin,
        appearance: updated.appearance,
      });
    }
    return updated;
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu tiến độ:', error);
    return loadProgress();
  }
}

/**
 * Đặt lại toàn bộ tiến độ về trạng thái ban đầu
 */
export function resetProgress(): GameProgress {
  try {
    localStorage.removeItem(SAVE_KEY);
    const fresh = { ...INITIAL_PROGRESS, lastSavedAt: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
    window.dispatchEvent(new CustomEvent(SAVE_EVENT, { detail: fresh }));
    EventBus.emit('player-updated', {
      playerName: fresh.playerName,
      playerSkin: fresh.playerSkin,
    });
    return fresh;
  } catch (error) {
    console.error('Lỗi khi reset tiến độ:', error);
    return { ...INITIAL_PROGRESS };
  }
}

/**
 * React Hook giúp theo dõi và cập nhật tiến độ tự động
 */
export function useProgress(): [GameProgress, (updates: Partial<GameProgress>) => void] {
  const [progress, setProgress] = useState<GameProgress>(loadProgress);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GameProgress>;
      if (customEvent.detail) {
        setProgress(customEvent.detail);
      } else {
        setProgress(loadProgress());
      }
    };

    window.addEventListener(SAVE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(SAVE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return [progress, saveProgress];
}
