/**
 * Rescue Phong - Game Progress Types and State
 */

export type MedalType = 'bronze' | 'silver' | 'gold';
export type DifficultyLevel = 'tapsu' | 'cuuhovien' | 'chuyengia';

export interface ScenarioRecord {
  scenarioId: string;
  bestDifficulty: DifficultyLevel;
  medal: MedalType;
  clearedAt: number;
}

export interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
  textSpeed: 'normal' | 'fast';
}

export interface GameProgress {
  version: number;
  playerName: string;
  playerSkin: number; // 0..5 (từ 6 nhân vật gốc của RPG Urban)

  // Quiz progress: levelKey -> stars (0..3) (VD: "c1_l1": 3)
  quizStars: Record<string, number>;

  // Scenario battle progress: scenarioId -> ScenarioRecord
  scenarioRecords: Record<string, ScenarioRecord>;

  // Badges earned: danh sách id huy hiệu
  badges: string[];

  // Knowledge: danh sách id thẻ đã học
  learnedCards: string[];

  // Terms Pokédex: danh sách id thuật ngữ đã mở khóa/đọc
  collectedTerms: string[];

  // Cài đặt hệ thống
  settings: PlayerSettings;

  // Lần lưu gần nhất
  lastSavedAt: number;
}

export const REQUIRED_STARS_FOR_CHAPTER_2 = 20;
export const REQUIRED_BADGES_FOR_KHU_2 = 3;

export const DEFAULT_SETTINGS: PlayerSettings = {
  soundEnabled: true,
  musicEnabled: true,
  reducedMotion: false,
  textSpeed: 'normal',
};

export const INITIAL_PROGRESS: GameProgress = {
  version: 1,
  playerName: 'Tân Binh Thể Chế',
  playerSkin: 0,
  quizStars: {},
  scenarioRecords: {},
  badges: [],
  learnedCards: [],
  collectedTerms: [],
  settings: DEFAULT_SETTINGS,
  lastSavedAt: Date.now(),
};

/**
 * Tính tổng số sao của một chương hoặc toàn bộ
 */
export function getTotalStars(quizStars: Record<string, number>, chapter?: number): number {
  return Object.entries(quizStars).reduce((sum, [key, stars]) => {
    if (chapter !== undefined) {
      if (!key.startsWith(`c${chapter}_`)) return sum;
    }
    return sum + (stars || 0);
  }, 0);
}

/**
 * Kiểm tra màn quiz có được mở khóa không
 */
export function isQuizLevelUnlocked(quizStars: Record<string, number>, chapter: number, level: number): boolean {
  if (chapter === 2 && !isChapter2Unlocked(quizStars)) {
    return false;
  }
  // Màn 1 luôn mở
  if (level === 1) return true;
  // Các màn sau yêu cầu màn trước đạt ít nhất 1 sao
  const prevKey = `c${chapter}_l${level - 1}`;
  return (quizStars[prevKey] ?? 0) >= 1;
}

/**
 * Kiểm tra Chương 2 đã mở khóa chưa (cần >= 20 sao ở Chương 1)
 */
export function isChapter2Unlocked(quizStars: Record<string, number>): boolean {
  return getTotalStars(quizStars, 1) >= REQUIRED_STARS_FOR_CHAPTER_2;
}

/**
 * Kiểm tra Khu 2 (Phố Lợi Ích) đã mở khóa chưa (cần >= 3 huy hiệu Thể chế Khu 1)
 */
export function isKhu2Unlocked(badges: string[]): boolean {
  return badges.length >= REQUIRED_BADGES_FOR_KHU_2;
}
