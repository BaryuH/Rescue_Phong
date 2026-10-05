/**
 * Nhóm 2 - Game Progress Types and State
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

export interface RpgDecision {
  scenarioId: string;
  stepChoices: string[]; // id của các lựa chọn đã chọn
  endingId: string;
  endingTitle: string;
  category: 'socialist' | 'capitalist' | 'compromise' | 'bureaucratic';
  resolvedAt: number;
}

export type FaceShape = 'oval' | 'round' | 'square' | 'sharp';
export type HairStyle =
  | 'short_neat'
  | 'undercut'
  | 'spiky'
  | 'bob'
  | 'long_wavy'
  | 'ponytail'
  | 'curly'
  | 'parted';
export type EyeStyle =
  | 'bright'
  | 'determined'
  | 'glasses'
  | 'sunglasses'
  | 'happy'
  | 'sharp';
export type MouthStyle =
  | 'smile'
  | 'grin'
  | 'confident'
  | 'serious'
  | 'straw'
  | 'mask';
export type AccessoryStyle =
  | 'none'
  | 'badge'
  | 'headband'
  | 'headphones'
  | 'blush';

export interface CharacterAppearance {
  baseSkin: number; // 0..5 (tương ứng với 6 nhân vật 2D của Kenney RPG Urban)
  gender: 'male' | 'female';
  faceShape: FaceShape;
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  eyeStyle: EyeStyle;
  eyeColor: string;
  mouthStyle: MouthStyle;
  accessory: AccessoryStyle;
  outfitColor?: string;
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  baseSkin: 0,
  gender: 'male',
  faceShape: 'oval',
  skinTone: '#f8d2b1',
  hairStyle: 'short_neat',
  hairColor: '#1e1e24',
  eyeStyle: 'bright',
  eyeColor: '#2a1810',
  mouthStyle: 'confident',
  accessory: 'badge',
  outfitColor: '#3b82f6',
};

export interface GameProgress {
  version: number;
  playerName: string;
  playerGender: 'male' | 'female';
  playerSkin: number; // 0..5 (từ 6 nhân vật gốc của RPG Urban)
  characterCreated: boolean;
  appearance?: CharacterAppearance;

  // Quiz progress: levelKey -> stars (0..3) (VD: "c1_l1": 3)
  quizStars: Record<string, number>;

  // Scenario battle progress: scenarioId -> ScenarioRecord
  scenarioRecords: Record<string, ScenarioRecord>;

  // Phán quyết RPG phân nhánh theo nhân vật: scenarioId -> RpgDecision
  rpgDecisions: Record<string, RpgDecision>;

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
  playerName: 'Nhà Cải Cách',
  playerGender: 'male',
  playerSkin: 0,
  characterCreated: false,
  appearance: DEFAULT_APPEARANCE,
  quizStars: {},
  scenarioRecords: {},
  rpgDecisions: {},
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
  // Màn 1 luôn mở cho cả Chương 1 và Chương 2
  if (level === 1) return true;
  // Các màn sau yêu cầu màn trước đạt ít nhất 1 sao
  const prevKey = `c${chapter}_l${level - 1}`;
  return (quizStars[prevKey] ?? 0) >= 1;
}

/**
 * Kiểm tra Chương 2 đã mở khóa chưa (mở sẵn từ đầu)
 */
export function isChapter2Unlocked(_quizStars?: Record<string, number>): boolean {
  return true;
}

/**
 * Kiểm tra Khu 2 (Phố Lợi Ích) đã mở khóa chưa (mở sẵn từ đầu)
 */
export function isKhu2Unlocked(_badges?: string[]): boolean {
  return true;
}
