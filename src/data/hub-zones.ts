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
export const WORLD_H = 320;

/**
 * Khối đặc của từng công trình — dùng làm vật cản.
 * Mặt tiền các toà nhà chìa xuống khác nhau nên không thể dùng một dải chung.
 */
export const HUB_BLOCKERS: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: 0, y1: 0, x2: 140, y2: 200 }, // chung cư gạch đỏ (Thư Viện)
  { x1: 140, y1: 0, x2: 324, y2: 227 }, // toà kính (Đấu Trường)
  { x1: 324, y1: 0, x2: 409, y2: 256 }, // quầy hàng nhô ra vỉa hè
  { x1: 409, y1: 0, x2: 532, y2: 200 }, // toà đá xám (Tòa Thử Thách)
  { x1: 624, y1: 0, x2: 674, y2: 200 }, // hàng rào gỗ đầu phố Đông
  { x1: 674, y1: 0, x2: 816, y2: 227 }, // cửa hàng mái hiên (Chợ Thuật Ngữ)
  { x1: 816, y1: 0, x2: WORLD_W, y2: 224 }, // cửa hàng kính góc Đông
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
    x: 49,
    y: 209,
    w: 26,
    h: 13,
    signY: 164,
    target: 'knowledge',
    transitionLabel: 'Khu Tri Thức • Thư Viện Bài Học',
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
    x: 247,
    y: 236,
    w: 48,
    h: 13,
    signY: 160,
    target: 'battle',
    transitionLabel: 'Đài Quan Sát • Đấu Trường Thể Chế',
    variant: 'battle',
  },
  {
    id: 'quiz',
    icon: '🎯',
    name: 'Tòa Thử Thách',
    shortName: 'Thử Thách',
    tagline: 'Bắn sao qua 20 màn trắc nghiệm',
    color: 0xf59e0b,
    hex: '#f59e0b',
    x: 429,
    y: 209,
    w: 38,
    h: 13,
    signY: 162,
    target: 'quiz',
    transitionLabel: 'Tòa Thử Thách • Thung Lũng Quiz',
    variant: 'default',
  },
  {
    id: 'glossary',
    icon: '🗄️',
    name: 'Chợ Thuật Ngữ',
    shortName: 'Thuật Ngữ',
    tagline: 'Sưu tầm 83 thuật ngữ Pokédex',
    color: 0x22d3ee,
    hex: '#22d3ee',
    x: 711,
    y: 236,
    w: 26,
    h: 13,
    signY: 160,
    target: 'knowledge',
    transitionLabel: 'Nhà Lưu Trữ • Tra Cứu Thuật Ngữ',
    variant: 'default',
  },
];
