/**
 * Rescue Phong — Manifest các khu vực trên Bản đồ Trung tâm.
 * Dùng chung cho HubScene (Phaser) và HubOverlay (React) để hai lớp không bao giờ lệch nhau.
 *
 * Toạ độ đo trực tiếp trên ảnh nền `public/assets/maps/city-base.png` (918x320 — bản đã bỏ viền gạch)
 * nên mỗi thảm bấm đều nằm đúng trước ngưỡng cửa thật của toà nhà.
 */

export type HubZoneId = 'library' | 'arena' | 'quiz' | 'glossary';

export interface HubZone {
  id: HubZoneId;
  icon: string;
  /** Tên hiển thị trên biển báo trong game */
  name: string;
  /** Tên rút gọn cho minimap */
  shortName: string;
  /** Mô tả ngắn hiển thị ở thanh điều hướng nhanh */
  tagline: string;
  /** Màu chủ đạo (số nguyên cho Phaser) */
  color: number;
  /** Cùng màu đó ở dạng hex cho CSS */
  hex: string;
  /** Tâm thảm bấm — ô vỉa hè ngay trước cửa */
  x: number;
  y: number;
  /** Kích thước thảm bấm, khớp bề ngang khung cửa thật */
  w: number;
  h: number;
  /** Độ cao đặt biển hiệu lơ lửng (toạ độ thế giới) */
  signY: number;
  target: 'knowledge' | 'quiz' | 'battle';
  transitionLabel: string;
  variant: 'default' | 'battle';
}

export const WORLD_W = 918;
export const WORLD_H = 515;

/**
 * Khối đặc của từng công trình — dùng làm vật cản.
 * Mặt tiền các toà nhà chìa xuống khác nhau nên không thể dùng một dải chung.
 */
export const HUB_BLOCKERS: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: 0, y1: 0, x2: 135, y2: 350 }, // cánh trái Thư Viện Tri Thức
  { x1: 200, y1: 0, x2: 300, y2: 350 }, // cánh phải Thư Viện Tri Thức
  { x1: 300, y1: 0, x2: 375, y2: 355 }, // cánh trái Đấu Trường Thể Chế
  { x1: 445, y1: 0, x2: 540, y2: 355 }, // cánh phải Đấu Trường Thể Chế
  { x1: 540, y1: 0, x2: 572, y2: 355 }, // cánh trái Tháp Thử Thách
  { x1: 638, y1: 0, x2: 745, y2: 355 }, // cánh phải Tháp Thử Thách
  { x1: 745, y1: 0, x2: 755, y2: 350 }, // mép trái Bảo Tàng Thuật Ngữ
  { x1: 825, y1: 0, x2: WORLD_W, y2: 350 }, // cánh phải Bảo Tàng Thuật Ngữ
];

export const HUB_ZONES: HubZone[] = [
  {
    id: 'library',
    icon: '📚',
    name: 'Thư Viện Tri Thức',
    shortName: 'Thư Viện',
    tagline: 'Đọc bài học & sơ đồ tư duy',
    color: 0x10b981,
    hex: '#10b981',
    x: 157,
    y: 370,
    w: 44,
    h: 14,
    signY: 175,
    target: 'knowledge',
    transitionLabel: 'Thư Viện Tri Thức • Bài Học & Sơ Đồ',
    variant: 'default',
  },
  {
    id: 'arena',
    icon: '⚔️',
    name: 'Đấu Trường Thể Chế',
    shortName: 'Đấu Trường',
    tagline: 'Giao đấu tình huống với NPC',
    color: 0xef4444,
    hex: '#ef4444',
    x: 407,
    y: 372,
    w: 46,
    h: 14,
    signY: 210,
    target: 'battle',
    transitionLabel: 'Đấu Trường Thể Chế • Phân Khu Tranh Biện',
    variant: 'battle',
  },
  {
    id: 'quiz',
    icon: '🎯',
    name: 'Thử Thách',
    shortName: 'Thử Thách',
    tagline: 'Bắn sao qua 20 màn trắc nghiệm',
    color: 0xf59e0b,
    hex: '#f59e0b',
    x: 605,
    y: 372,
    w: 40,
    h: 14,
    signY: 205,
    target: 'quiz',
    transitionLabel: 'Thử Thách • Thung Lũng Quiz',
    variant: 'default',
  },
  {
    id: 'glossary',
    icon: '🏛️',
    name: 'Bảo Tàng Thuật Ngữ',
    shortName: 'Bảo Tàng',
    tagline: 'Chiêm ngưỡng kho tàng 83 thuật ngữ',
    color: 0x22d3ee,
    hex: '#22d3ee',
    x: 790,
    y: 372,
    w: 36,
    h: 14,
    signY: 175,
    target: 'knowledge',
    transitionLabel: 'Bảo Tàng Thuật Ngữ • Tra Cứu Khái Niệm',
    variant: 'default',
  },
];
