import React, { useState, useEffect } from 'react';
import { User, Sparkles, Dices, GraduationCap, X } from 'lucide-react';
import { EventBus } from '../game/EventBus';
import { sound } from '../systems/audio';

interface CharacterCreationModalProps {
  currentName?: string;
  currentGender?: 'male' | 'female';
  currentSkin?: number;
  isFirstTime?: boolean;
  onSave: (data: { playerName: string; playerGender: 'male' | 'female'; playerSkin: number }) => void;
  onClose?: () => void;
}

const GENDER_CONFIG = {
  male: {
    skinId: 0,
    title: 'Sinh Viên Nam',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0023.png',
    badge: '👦 Nam',
    color: '#3b82f6',
  },
  female: {
    skinId: 1,
    title: 'Sinh Viên Nữ',
    tileFile: 'assets/kenney/rpg-urban/Tiles/tile_0104.png',
    badge: '👧 Nữ',
    color: '#ec4899',
  },
};

const RANDOM_NAMES_MALE = [
  'Hoàng Phong',
  'Minh Anh',
  'Bảo Nam',
  'Hải Đăng',
  'Nhật Minh',
  'Gia Huy',
  'Quốc Bảo',
  'Tuấn Kiệt',
  'Đức Duy',
  'Thành Long',
];

const RANDOM_NAMES_FEMALE = [
  'Phương Anh',
  'Khánh Linh',
  'Tuệ Lâm',
  'Thanh Hằng',
  'Bảo Ngọc',
  'Thùy Chi',
  'Mai Anh',
  'Hà My',
  'Huyền Trang',
  'Lan Anh',
];

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  currentName = 'Nhà Cải Cách',
  currentGender = 'male',
  isFirstTime = false,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(
    currentName === 'Tân Binh Thể Chế' || currentName === 'Nhà Cải Cách' ? '' : currentName
  );
  const [gender, setGender] = useState<'male' | 'female'>(currentGender);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setIsSubmitted(false);
  }, [currentName, currentGender]);

  if (isSubmitted) {
    return null;
  }

  const activeGender = GENDER_CONFIG[gender];

  const handleGenderSelect = (newGender: 'male' | 'female') => {
    sound.playClick();
    setGender(newGender);
  };

  const handleRandomName = () => {
    sound.playClick();
    const list = gender === 'male' ? RANDOM_NAMES_MALE : RANDOM_NAMES_FEMALE;
    const randomPick = list[Math.floor(Math.random() * list.length)];
    setName(randomPick);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Vui lòng nhập tên cho nhân vật của bạn!');
      return;
    }
    if (cleanName.length > 22) {
      setError('Tên nhân vật không vượt quá 22 ký tự!');
      return;
    }

    sound.playVictory();
    setIsSubmitted(true);
    const assignedSkin = GENDER_CONFIG[gender].skinId;
    onSave({
      playerName: cleanName,
      playerGender: gender,
      playerSkin: assignedSkin,
    });
    EventBus.emit('player-updated', {
      playerName: cleanName,
      playerSkin: assignedSkin,
    });
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl shadow-emerald-950/70 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 tracking-wide flex items-center gap-2">
                <span>{isFirstTime ? 'CHÀO MỪNG TÂN BINH' : 'HỒ SƠ NHÂN VẬT'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  KTCT 2026
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isFirstTime
                  ? 'Đặt tên và chọn giới tính để bắt đầu hành trình!'
                  : 'Thay đổi tên và giới tính hiển thị trong game'}
              </p>
            </div>
          </div>

          {!isFirstTime && onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nội dung Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* 1. KHUNG PREVIEW & NHẬP TÊN */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
            {/* Ảnh đại diện preview theo giới tính */}
            <div className="w-18 h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shrink-0">
              <img
                src={activeGender.tileFile}
                alt={activeGender.title}
                className="w-12 h-12 object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] transition-transform hover:scale-110"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-[9px] font-bold text-emerald-400 mt-1">
                {activeGender.badge}
              </span>
            </div>

            {/* Ô nhập tên */}
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Họ và Tên Nhân Vật</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="Nhập tên... (VD: Minh Phong)"
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 font-medium transition-all outline-none"
                  autoFocus={isFirstTime}
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  title="Gợi ý tên ngẫu nhiên"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-amber-300 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Dices className="w-4 h-4" />
                  <span className="hidden sm:inline">Gợi ý</span>
                </button>
              </div>

              {error && <p className="text-[11px] text-rose-400 font-semibold">{error}</p>}
            </div>
          </div>

          {/* 2. CHỌN GIỚI TÍNH */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chọn Giới Tính Nhân Vật</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGenderSelect('male')}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-black text-sm transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'bg-blue-950/70 border-blue-500 text-blue-200 shadow-lg shadow-blue-950/60 scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-2xl">👦</span>
                <span>NAM</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderSelect('female')}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-black text-sm transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'bg-pink-950/70 border-pink-500 text-pink-200 shadow-lg shadow-pink-950/60 scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-2xl">👧</span>
                <span>NỮ</span>
              </button>
            </div>
          </div>

          {/* 3. NÚT XÁC NHẬN */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isFirstTime ? 'Bắt Đầu Khám Phá' : 'Lưu Thay Đổi'}</span>
              <span className="text-base">!!!</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
