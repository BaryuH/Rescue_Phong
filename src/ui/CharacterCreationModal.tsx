import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Dices,
  GraduationCap,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Palette,
  Eye,
  Smile,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { EventBus } from '../game/EventBus';
import { sound } from '../systems/audio';
import {
  CharacterAppearance,
  DEFAULT_APPEARANCE,
  FaceShape,
  HairStyle,
  EyeStyle,
  MouthStyle,
  AccessoryStyle,
} from '../systems/progress';
import { CharacterAvatar } from './CharacterAvatar';

interface CharacterCreationModalProps {
  currentName?: string;
  currentGender?: 'male' | 'female';
  currentSkin?: number;
  currentAppearance?: CharacterAppearance;
  isFirstTime?: boolean;
  onSave: (data: {
    playerName: string;
    playerGender: 'male' | 'female';
    playerSkin: number;
    appearance: CharacterAppearance;
  }) => void;
  onClose?: () => void;
}

// 6 Archetype nhân vật kinh điển của game (Nhân vật bản cũ, không dùng Dragon Ball)
export const ARCHETYPES = [
  {
    id: 0,
    gender: 'male' as const,
    title: 'Sinh Viên Kinh Tế Chính Trị',
    subtitle: 'Năng động, nhiệt huyết học hỏi và đổi mới',
    badge: '👦 Nam Sinh',
    role: 'Tiên Phong',
    outfitColor: '#2563eb',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0024.png',
  },
  {
    id: 1,
    gender: 'female' as const,
    title: 'Nữ Sinh Nghiên Cứu Thể Chế',
    subtitle: 'Thanh lịch, chu đáo và sâu sắc lý luận',
    badge: '👧 Nữ Sinh',
    role: 'Lý Luận',
    outfitColor: '#ec4899',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0105.png',
  },
  {
    id: 2,
    gender: 'male' as const,
    title: 'Cán Bộ Cải Cách Trẻ',
    subtitle: 'Lịch lãm, quyết đoán trước mọi bài toán thị trường',
    badge: '👔 Cán Bộ',
    role: 'Chiến Lược',
    outfitColor: '#0284c7',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0186.png',
  },
  {
    id: 3,
    gender: 'male' as const,
    title: 'Thanh Niên Tình Nguyện Cơ Sở',
    subtitle: 'Gần gũi nhân dân, thực tiễn và lăn xả',
    badge: '🧡 Tình Nguyện',
    role: 'Thực Tiễn',
    outfitColor: '#ea580c',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0267.png',
  },
  {
    id: 4,
    gender: 'male' as const,
    title: 'Kỹ Sư Công Nghệ Thể Chế',
    subtitle: 'Hiện đại, tư duy số hóa quản lý công',
    badge: '⚡ Kỹ Sư',
    role: 'Công Nghệ',
    outfitColor: '#0d9488',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0348.png',
  },
  {
    id: 5,
    gender: 'female' as const,
    title: 'Nữ Thủ Lĩnh Phong Trào',
    subtitle: 'Bản lĩnh, truyền cảm hứng và kiên định',
    badge: '🌟 Thủ Lĩnh',
    role: 'Thủ Lĩnh',
    outfitColor: '#8b5cf6',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0429.png',
  },
];

// Danh sách kiểu tóc
export const HAIR_STYLES: { id: HairStyle; label: string; desc: string }[] = [
  { id: 'short_neat', label: 'Thư Sinh', desc: 'Gọn gàng, lịch lãm' },
  { id: 'undercut', label: 'Undercut', desc: 'Hiện đại, cá tính' },
  { id: 'spiky', label: 'Tém Nhọn', desc: 'Năng động, thể thao' },
  { id: 'bob', label: 'Tóc Bob', desc: 'Trẻ trung, thông minh' },
  { id: 'long_wavy', label: 'Bềnh Bồng', desc: 'Lãng tử, duyên dáng' },
  { id: 'ponytail', label: 'Búi Đuôi Ngựa', desc: 'Năng nổ, tháo vát' },
  { id: 'curly', label: 'Uốn Xoăn', desc: 'Nghệ sĩ, lãng mạn' },
  { id: 'parted', label: 'Rẽ Ngôi 7/3', desc: 'Chuẩn mực, tri thức' },
];

// Danh sách màu tóc
export const HAIR_COLORS = [
  { hex: '#1e1e24', name: 'Đen Tuyền' },
  { hex: '#4a2e18', name: 'Nâu Hạt Dẻ' },
  { hex: '#7b3f00', name: 'Nâu Đồng' },
  { hex: '#b45309', name: 'Vàng Cát' },
  { hex: '#cbd5e1', name: 'Bạch Kim' },
  { hex: '#047857', name: 'Xanh Rêu' },
  { hex: '#db2777', name: 'Hồng Pastel' },
  { hex: '#2563eb', name: 'Xanh Biển' },
];

// Dáng khuôn mặt
export const FACE_SHAPES: { id: FaceShape; label: string; desc: string }[] = [
  { id: 'oval', label: 'Trái Xoan', desc: 'Cân đối, hài hòa' },
  { id: 'round', label: 'Mặt Tròn', desc: 'Phúc hậu, thân thiện' },
  { id: 'square', label: 'Chữ Điền', desc: 'Góc cạnh, kiên định' },
  { id: 'sharp', label: 'Sắc Sảo V-line', desc: 'Thanh tú, hiện đại' },
];

// Màu da
export const SKIN_TONES = [
  { hex: '#ffdfc4', name: 'Trắng Sáng' },
  { hex: '#f8d2b1', name: 'Trắng Hồng' },
  { hex: '#e8b588', name: 'Tự Nhiên' },
  { hex: '#c68642', name: 'Bánh Mật' },
  { hex: '#8d5524', name: 'Rám Nắng' },
];

// Kiểu mắt
export const EYE_STYLES: { id: EyeStyle; label: string; icon: string; desc: string }[] = [
  { id: 'bright', label: 'Mắt Sáng', icon: '✨', desc: 'Tinh anh, hiếu học' },
  { id: 'determined', label: 'Kiên Định', icon: '🔥', desc: 'Quyết tâm cải cách' },
  { id: 'glasses', label: 'Kính Cận', icon: '👓', desc: 'Trí thức, học giả' },
  { id: 'sunglasses', label: 'Kính Râm', icon: '🕶️', desc: 'Siêu ngầu, bản lĩnh' },
  { id: 'happy', label: 'Mắt Cười', icon: '😄', desc: 'Vui tươi, rạng rỡ' },
  { id: 'sharp', label: 'Sắc Bén', icon: '👁️', desc: 'Tinh tường phân tích' },
];

// Màu mắt
export const EYE_COLORS = [
  { hex: '#2a1810', name: 'Nâu Đen' },
  { hex: '#92400e', name: 'Hổ Phách' },
  { hex: '#1e3a8a', name: 'Xanh Dương' },
  { hex: '#065f46', name: 'Lục Bảo' },
  { hex: '#4c1d95', name: 'Tím Huyền' },
];

// Khuôn miệng
export const MOUTH_STYLES: { id: MouthStyle; label: string; icon: string; desc: string }[] = [
  { id: 'smile', label: 'Cười Mỉm', icon: '🙂', desc: 'Thân thiện, nhã nhặn' },
  { id: 'grin', label: 'Cười Tươi', icon: '😁', desc: 'Nhiệt tình, lạc quan' },
  { id: 'confident', label: 'Tự Tin', icon: '😏', desc: 'Khí chất bản lĩnh' },
  { id: 'serious', label: 'Nghiêm Túc', icon: '😐', desc: 'Tập trung cao độ' },
  { id: 'straw', label: 'Ngậm Cỏ', icon: '🌾', desc: 'Phong lưu, tự tại' },
  { id: 'mask', label: 'Khẩu Trang', icon: '😷', desc: 'Văn minh, an toàn' },
];

// Phụ kiện
export const ACCESSORIES: { id: AccessoryStyle; label: string; icon: string }[] = [
  { id: 'none', label: 'Không', icon: '❌' },
  { id: 'badge', label: 'Huy Hiệu Đỏ', icon: '⭐' },
  { id: 'headband', label: 'Băng Đô Đỏ', icon: '🎗️' },
  { id: 'headphones', label: 'Tai Nghe Công Nghệ', icon: '🎧' },
  { id: 'blush', label: 'Má Hồng', icon: '🌸' },
];

const RANDOM_NAMES = [
  'Hoàng Phong',
  'Minh Anh',
  'Bảo Nam',
  'Hải Đăng',
  'Nhật Minh',
  'Gia Huy',
  'Đăng Khoa',
  'Phương Anh',
  'Khánh Linh',
  'Tuệ Lâm',
  'Bảo Ngọc',
  'Thùy Chi',
  'Hà My',
  'Quốc Bảo',
  'Thành Long',
];

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  currentName = 'Nhà Cải Cách',
  currentGender = 'male',
  currentSkin = 0,
  currentAppearance,
  isFirstTime = false,
  onSave,
  onClose,
}) => {
  const [tab, setTab] = useState<'grid' | 'face' | 'hair' | 'eyes' | 'mouth' | 'profile'>('grid');
  const [name, setName] = useState(
    currentName === 'Tân Binh Thể Chế' || currentName === 'Nhà Cải Cách' ? '' : currentName
  );
  const [appearance, setAppearance] = useState<CharacterAppearance>(() => ({
    ...DEFAULT_APPEARANCE,
    baseSkin: currentSkin,
    gender: currentGender,
    ...(currentAppearance || {}),
  }));
  const [error, setError] = useState<string | null>(null);

  const tabsList = [
    { id: 'grid' as const, title: 'Võ Đài Tướng', icon: Shield },
    { id: 'face' as const, title: 'Mặt & Da', icon: User },
    { id: 'hair' as const, title: 'Kiểu Tóc', icon: Palette },
    { id: 'eyes' as const, title: 'Đôi Mắt', icon: Eye },
    { id: 'mouth' as const, title: 'Miệng & Phụ Kiện', icon: Smile },
    { id: 'profile' as const, title: 'Hồ Sơ', icon: GraduationCap },
  ];

  const handleArchetypeSelect = (arch: (typeof ARCHETYPES)[0]) => {
    sound.playClick();
    setAppearance((prev) => ({
      ...prev,
      baseSkin: arch.id,
      gender: arch.gender,
      outfitColor: arch.outfitColor,
    }));
  };

  const handleRandomizeAll = () => {
    sound.playClick();
    const randomArch = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const randomFace = FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)].id;
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].hex;
    const randomHair = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].hex;
    const randomEye = EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)].id;
    const randomEyeColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].hex;
    const randomMouth = MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)].id;
    const randomAcc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id;
    const randomNamePick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];

    setAppearance({
      baseSkin: randomArch.id,
      gender: randomArch.gender,
      outfitColor: randomArch.outfitColor,
      faceShape: randomFace,
      skinTone: randomSkin,
      hairStyle: randomHair,
      hairColor: randomHairColor,
      eyeStyle: randomEye,
      eyeColor: randomEyeColor,
      mouthStyle: randomMouth,
      accessory: randomAcc,
    });
    setName(randomNamePick);
    setError(null);
  };

  const handleRandomName = () => {
    sound.playClick();
    const randomPick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(randomPick);
    setError(null);
  };

  const handleFinish = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cleanName = name.trim() || 'Nhà Cải Cách';
    if (cleanName.length > 22) {
      setError('Tên nhân vật không vượt quá 22 ký tự!');
      setTab('profile');
      return;
    }

    sound.playVictory();
    onSave({
      playerName: cleanName,
      playerGender: appearance.gender,
      playerSkin: appearance.baseSkin,
      appearance,
    });
    EventBus.emit('player-updated', {
      playerName: cleanName,
      playerSkin: appearance.baseSkin,
      appearance,
    });
    if (onClose) {
      onClose();
    }
  };

  const currentArchetype = ARCHETYPES.find((a) => a.id === appearance.baseSkin) || ARCHETYPES[0];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-1 sm:p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* KHUNG VÒM VÕ ĐÀI RỒNG THẦN (PHONG CÁCH ẢNH 1 NHƯNG NHÂN VẬT BẢN CŨ) */}
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#231509] via-[#140b04] to-[#0d0703] border-3 sm:border-4 border-amber-500/80 rounded-3xl shadow-[0_0_60px_rgba(217,119,6,0.5)] overflow-hidden flex flex-col max-h-[96vh]">
        {/* ======================================================== */}
        {/* BỨC TRANH RỒNG THẦN CUỘN MÌNH PHÍA SAU (Y HỆT PHÔNG NỀN ẢNH 1) */}
        {/* ======================================================== */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {/* Hình vóc rồng thiêng phương Đông uốn lượn */}
          <svg viewBox="0 0 1000 600" className="w-full h-full object-cover">
            <path
              d="M 50 300 Q 250 80 500 280 T 950 200 Q 750 500 500 450 T 100 500"
              fill="none"
              stroke="#eab308"
              strokeWidth="50"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M 150 280 Q 350 150 550 320 T 850 300"
              fill="none"
              stroke="#b45309"
              strokeWidth="25"
              opacity="0.6"
            />
            {/* Đầu rồng oai nghiêm mở hàm */}
            <circle cx="500" cy="280" r="70" fill="#78350f" opacity="0.5" />
            <polygon points="460,250 540,250 500,320" fill="#dc2626" opacity="0.8" />
          </svg>
        </div>

        {/* ======================================================== */}
        {/* HEADER VÒM VÕ ĐÀI CHỌN TƯỚNG (HEADER NHƯ ẢNH 1) */}
        {/* ======================================================== */}
        <div className="relative z-10 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-950 via-red-950 to-amber-950 border-b-2 border-amber-500/60 flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-amber-200 tracking-wider flex items-center gap-2 uppercase">
                <span>VÕ ĐÀI CHỌN TƯỚNG & TẠO HÌNH AVATAR</span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-amber-200 border border-amber-300 font-mono font-bold shadow-sm">
                  KTCT 2D
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80 font-medium">
                Chọn hình tượng nhân vật trên võ đài Rồng Thiêng và tùy biến diện mạo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomizeAll}
              title="Ngẫu nhiên toàn bộ diện mạo"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 border border-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">Ngẫu Nhiên</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* THANH TAB ĐIỀU HƯỚNG TÙY BIẾN CHI TIẾT */}
        {/* ======================================================== */}
        <div className="relative z-10 bg-slate-950/80 border-b border-amber-500/30 px-2 sm:px-6 py-1.5 overflow-x-auto flex items-center gap-1.5 sm:gap-2 shrink-0 no-scrollbar">
          {tabsList.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTab(t.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                    : 'bg-slate-900/80 text-amber-200/80 hover:bg-slate-800 hover:text-amber-100 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* NỘI DUNG CHÍNH: 2 CỘT (PREVIEW TRÁI + NỘI DUNG TAB PHẢI) */}
        {/* ======================================================== */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* ---------------------------------------------------- */}
          {/* CỘT TRÁI: LIVE 2D AVATAR PREVIEW (md:col-span-4) */}
          {/* ---------------------------------------------------- */}
          <div className="md:col-span-4 flex flex-col items-center bg-slate-950/90 border-2 border-amber-500/40 p-4 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Avatar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
                {currentArchetype.badge}
              </span>
            </div>

            {/* Avatar chính lớn */}
            <div className="relative my-1">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-400/60 flex items-center justify-center p-2 relative shadow-2xl overflow-hidden">
                <CharacterAvatar appearance={appearance} size={150} showAura animate />
              </div>

              {/* Sprite Kenney thu nhỏ góc đối chiếu */}
              <div
                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-400 flex flex-col items-center justify-center shadow-lg"
                title="Sprite nhân vật 2D trên bản đồ"
              >
                <img
                  src={`/${currentArchetype.tileFile}`}
                  alt="Sprite"
                  className="w-8 h-8 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Tên nhân vật & Vai trò */}
            <div className="text-center mt-2 w-full space-y-0.5">
              <h3 className="text-base font-black text-amber-100 truncate px-2">
                {name.trim() || 'Nhà Cải Cách'}
              </h3>
              <p className="text-xs text-amber-400 font-bold">{currentArchetype.title}</p>
            </div>

            {/* Tóm tắt diện mạo */}
            <div className="w-full grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-amber-500/20 text-[10px]">
              <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 font-medium">Kiểu tóc:</span>
                <span className="font-bold text-amber-200">
                  {HAIR_STYLES.find((h) => h.id === appearance.hairStyle)?.label}
                </span>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 font-medium">Ánh mắt:</span>
                <span className="font-bold text-amber-200">
                  {EYE_STYLES.find((e) => e.id === appearance.eyeStyle)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* CỘT PHẢI: NỘI DUNG TAB (md:col-span-8) */}
          {/* ---------------------------------------------------- */}
          <div className="md:col-span-8 flex flex-col gap-3">
            {/* ======================================================== */}
            {/* TAB 1: VÕ ĐÀI TƯỚNG (LƯỚI CHỌN TƯỚNG CHUẨN PHONG CÁCH ẢNH 1) */}
            {/* ======================================================== */}
            {tab === 'grid' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚔️ LƯỚI CHỌN HÌNH TƯỢNG VÕ ĐÀI</span>
                  </h3>
                  <span className="text-[11px] text-amber-400/80 font-bold">
                    Bấm để chọn nhân vật
                  </span>
                </div>

                {/* LƯỚI CÁC Ô TƯỚNG (GRID BOXES Y HỆT ẢNH 1 NHƯNG NHÂN VẬT BẢN CŨ) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {ARCHETYPES.map((arch) => {
                    const isSelected = appearance.baseSkin === arch.id;
                    return (
                      <div key={arch.id} className="relative flex flex-col items-center">
                        {/* MŨI TÊN TAM GIÁC XANH LÁ CHỈ VÀO Ô ĐANG CHỌN (Y HỆT ẢNH 1) */}
                        {isSelected && (
                          <div className="absolute -top-3.5 z-30 animate-bounce">
                            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-lime-400 filter drop-shadow-[0_0_8px_rgba(163,230,53,1)]" />
                          </div>
                        )}

                        {/* Ô chân dung nhân vật (Fighter Tile Box) */}
                        <button
                          type="button"
                          onClick={() => handleArchetypeSelect(arch)}
                          className={`w-full group relative p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-amber-950 border-3 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.6)] scale-105 z-20'
                              : 'bg-slate-950/80 hover:bg-slate-900 border-2 border-slate-700/80 hover:border-amber-400/80 hover:scale-102'
                          }`}
                        >
                          {/* Chân dung Sprite bản cũ sắc nét */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center p-1 relative overflow-hidden group-hover:border-amber-400 transition-colors">
                            <img
                              src={`/${arch.tileFile}`}
                              alt={arch.title}
                              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-lime-400/10 pointer-events-none" />
                            )}
                          </div>

                          {/* Tên & vai trò */}
                          <div className="mt-2 text-center w-full">
                            <span className="text-[11px] font-black text-slate-100 block truncate">
                              {arch.title}
                            </span>
                            <span className="text-[9px] font-bold text-amber-400 block mt-0.5">
                              {arch.badge} • {arch.role}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: MẶT & DA (FACE & SKIN) */}
            {/* ======================================================== */}
            {tab === 'face' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    1. Dáng khuôn mặt
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {FACE_SHAPES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, faceShape: f.id }));
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          appearance.faceShape === f.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs font-bold block">{f.label}</span>
                        <span className="text-[10px] text-slate-400">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    2. Tông màu da
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {SKIN_TONES.map((s) => (
                      <button
                        key={s.hex}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, skinTone: s.hex }));
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                          appearance.skinTone === s.hex
                            ? 'border-amber-400 bg-amber-500/20 scale-105'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/30 shadow-sm"
                          style={{ backgroundColor: s.hex }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: KIỂU TÓC & MÀU TÓC (HAIR) */}
            {/* ======================================================== */}
            {tab === 'hair' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    1. Kiểu tóc
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, hairStyle: h.id }));
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          appearance.hairStyle === h.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs font-bold block">{h.label}</span>
                        <span className="text-[9px] text-slate-400">{h.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    2. Màu tóc
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, hairColor: c.hex }));
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                          appearance.hairColor === c.hex
                            ? 'border-amber-400 bg-amber-500/20 scale-105'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/30 shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 mt-1 truncate w-full text-center">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: ĐÔI MẮT & MÀU MẮT (EYES) */}
            {/* ======================================================== */}
            {tab === 'eyes' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    1. Kiểu mắt
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EYE_STYLES.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, eyeStyle: e.id }));
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          appearance.eyeStyle === e.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xl">{e.icon}</span>
                        <div>
                          <span className="text-xs font-bold block">{e.label}</span>
                          <span className="text-[9px] text-slate-400">{e.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    2. Màu tròng mắt
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {EYE_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, eyeColor: c.hex }));
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                          appearance.eyeColor === c.hex
                            ? 'border-amber-400 bg-amber-500/20 scale-105'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/30 shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: MIỆNG & PHỤ KIỆN (MOUTH & ACCESSORIES) */}
            {/* ======================================================== */}
            {tab === 'mouth' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    1. Nụ cười & Biểu cảm
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MOUTH_STYLES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, mouthStyle: m.id }));
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          appearance.mouthStyle === m.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <span className="text-xs font-bold block">{m.label}</span>
                          <span className="text-[9px] text-slate-400">{m.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    2. Phụ kiện đặc biệt
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {ACCESSORIES.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAppearance((prev) => ({ ...prev, accessory: a.id }));
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                          appearance.accessory === a.id
                            ? 'border-amber-400 bg-amber-500/20 scale-105'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xl">{a.icon}</span>
                        <span className="text-[10px] font-bold text-slate-300 mt-1 truncate w-full text-center">
                          {a.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: HỒ SƠ & TỰ CHỌN TÊN (PROFILE & NAME) */}
            {/* ======================================================== */}
            {tab === 'profile' && (
              <div className="flex flex-col gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase mb-2">
                    Tên sinh viên / Nhân vật của bạn:
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                      maxLength={22}
                      placeholder="Nhập tên nhân vật..."
                      className="flex-1 bg-slate-900 border-2 border-amber-400/80 rounded-xl px-3 py-2 text-sm font-black text-amber-100 focus:outline-none shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleRandomName}
                      className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Dices className="w-4 h-4" />
                      <span>Ngẫu nhiên</span>
                    </button>
                  </div>
                  {error && <p className="text-xs text-rose-400 mt-1 font-bold">{error}</p>}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* NÚT XÁC NHẬN & VÀO GAME CHÍNH (R MỚI VÀO CÁI CHÍNH) */}
            {/* ======================================================== */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-500/30 mt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  const tabOrder: ('grid' | 'face' | 'hair' | 'eyes' | 'mouth' | 'profile')[] = [
                    'grid',
                    'face',
                    'hair',
                    'eyes',
                    'mouth',
                    'profile',
                  ];
                  const currentIdx = tabOrder.indexOf(tab);
                  if (currentIdx > 0) {
                    setTab(tabOrder[currentIdx - 1]);
                  }
                }}
                disabled={tab === 'grid'}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-2">
                {tab !== 'profile' ? (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      const tabOrder: ('grid' | 'face' | 'hair' | 'eyes' | 'mouth' | 'profile')[] = [
                        'grid',
                        'face',
                        'hair',
                        'eyes',
                        'mouth',
                        'profile',
                      ];
                      const currentIdx = tabOrder.indexOf(tab);
                      setTab(tabOrder[currentIdx + 1]);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : null}

                {/* Nút Hoàn tất để vào game chính */}
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-600 border-2 border-lime-200 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer active:scale-95 transition-transform"
                >
                  <span>XÁC NHẬN & VÀO GAME</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
