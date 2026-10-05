import React, { useState, useEffect } from 'react';
import {
  Settings,
  BookOpen,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Dices,
  Edit2,
  Check,
  Star,
  Award,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  TrendingUp,
  Coins,
  Shield,
  Gift,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { GameProgress } from '../systems/progress';
import { ARCHETYPES } from './CharacterCreationModal';
import { PixelCharacterHero } from './PixelCharacterHero';
import { VietnamEconomicPieCard } from './VietnamEconomicPieCard';
import { sound } from '../systems/audio';

interface LobbyViewProps {
  progress: GameProgress;
  totalStars: number;
  onStartGame: (targetScene?: 'hub' | 'battle') => void;
  onOpenCharacterCreation: () => void;
  onOpenModal: (type: 'profile' | 'badges' | 'leaderboard' | 'settings') => void;
  onUpdatePlayer: (updates: {
    playerName?: string;
    playerSkin?: number;
    appearance?: GameProgress['appearance'];
  }) => void;
}

const VIETNAM_NAMES = [
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
  'Hữu Phước',
  'Quang Dũng',
  'Thanh Trúc',
  'Mỹ Duyên',
  'Ngọc Hân',
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  progress,
  totalStars,
  onStartGame,
  onOpenCharacterCreation,
  onOpenModal,
  onUpdatePlayer,
}) => {
  const [currentSkinIndex, setCurrentSkinIndex] = useState(progress.playerSkin ?? 0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.playerName || 'Nhà Cải Cách');
  const [economyCoins, setEconomyCoins] = useState(50000000); // 50 Triệu VNĐ vốn ban đầu
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentArchetype = ARCHETYPES[currentSkinIndex] || ARCHETYPES[0];

  // Lắng nghe phím SPACE trên bàn phím để vào chọn tướng & avatar ngay lập tức (cả chuột và SPACE)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nếu đang gõ tên trong ô input hoặc textarea thì không can thiệp phím cách
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
        sound.playClick();
        onOpenCharacterCreation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenCharacterCreation]);

  // Xử lý chuyển đổi Archetype nhân vật bằng mũi tên < và >
  const handlePrevHero = () => {
    sound.playClick();
    const nextIdx = (currentSkinIndex - 1 + ARCHETYPES.length) % ARCHETYPES.length;
    setCurrentSkinIndex(nextIdx);
    const arch = ARCHETYPES[nextIdx];
    onUpdatePlayer({
      playerSkin: nextIdx,
      appearance: {
        ...(progress.appearance || {}),
        baseSkin: nextIdx,
        gender: arch.gender,
        outfitColor: arch.outfitColor,
      } as any,
    });
  };

  const handleNextHero = () => {
    sound.playClick();
    const nextIdx = (currentSkinIndex + 1) % ARCHETYPES.length;
    setCurrentSkinIndex(nextIdx);
    const arch = ARCHETYPES[nextIdx];
    onUpdatePlayer({
      playerSkin: nextIdx,
      appearance: {
        ...(progress.appearance || {}),
        baseSkin: nextIdx,
        gender: arch.gender,
        outfitColor: arch.outfitColor,
      } as any,
    });
  };

  // Đổi tên ngẫu nhiên (tuyệt đối không lấy Tuấn Kiệt)
  const handleRandomName = () => {
    sound.playClick();
    const validNames = VIETNAM_NAMES.filter((n) => n !== 'Tuấn Kiệt' && n !== nameInput);
    const randomPick = validNames[Math.floor(Math.random() * validNames.length)] || 'Hoàng Phong';
    setNameInput(randomPick);
    onUpdatePlayer({ playerName: randomPick });
  };

  // Lưu tên khi gõ xong
  const handleSaveName = () => {
    const clean = nameInput.trim();
    if (!clean) return;
    setIsEditingName(false);
    onUpdatePlayer({ playerName: clean });
  };

  // Toàn màn hình

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col justify-between font-sans select-none">
      {/* ======================================================== */}
      {/* ẢNH NỀN KHÔNG GIAN ĐẠO ĐẦU PHONG CÁCH QUẢNG TRƯỜNG VIỆT NAM */}
      {/* (Lấy cảm hứng từ sân đấu Ninja Clash Heroes & Văn hóa Việt Nam) */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bầu trời hoàng hôn tím hồng ấm áp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a133d] via-[#431846] to-[#160d2b]" />

        {/* Các cánh hoa đào / hoa mai rơi nhẹ trong gió như ảnh 1 */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute w-2 h-2 rounded-full bg-pink-300 blur-[0.5px] top-12 left-[15%] animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-rose-400 blur-[0.5px] top-24 left-[35%] animate-bounce" style={{ animationDuration: '3.5s' }} />
          <div className="absolute w-2 h-2 rounded-full bg-pink-200 blur-[0.5px] top-16 right-[20%] animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute w-3 h-3 rounded-full bg-rose-300 blur-[0.5px] top-40 right-[40%] animate-ping" style={{ animationDuration: '5s' }} />
        </div>

        {/* Kiến trúc cổng Tam Quan & Thành Phố Xã Hội Chủ Nghĩa phía xa */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <svg viewBox="0 0 1000 600" className="w-full h-full object-cover">
            {/* Cổng tam quan mái cong truyền thống */}
            <path d="M 300 350 L 300 240 Q 500 210 700 240 L 700 350 Z" fill="#b91c1c" />
            <path d="M 260 250 Q 500 190 740 250 L 710 240 Q 500 210 290 240 Z" fill="#eab308" />
            <rect x="420" y="270" width="160" height="180" rx="80" fill="#0f172a" />
            {/* Cột trụ hai bên */}
            <rect x="330" y="250" width="35" height="200" fill="#7f1d1d" />
            <rect x="635" y="250" width="35" height="200" fill="#7f1d1d" />
          </svg>
        </div>

        {/* Tượng Sư Tử Đá / Nghê Đá Vàng Uy Nghi 2 bên (như ảnh 1) */}
        <div className="absolute bottom-28 left-6 md:left-24 hidden sm:flex flex-col items-center opacity-85 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <div className="text-4xl md:text-6xl animate-pulse" style={{ animationDuration: '4s' }}>
            🦁
          </div>
          <div className="w-16 h-3 bg-amber-600/40 rounded-full blur-xs mt-1" />
          <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest mt-1">
            Nghê Trấn Thể Chế
          </span>
        </div>

        <div className="absolute bottom-28 right-6 md:right-24 hidden sm:flex flex-col items-center opacity-85 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <div className="text-4xl md:text-6xl animate-pulse" style={{ animationDuration: '4.5s' }}>
            🦁
          </div>
          <div className="w-16 h-3 bg-amber-600/40 rounded-full blur-xs mt-1" />
          <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest mt-1">
            Nghê Bảo Hộ Thị Trường
          </span>
        </div>

        {/* Nền sân lát đá hoa văn cổ (như mặt sàn trong ảnh 1 & 2) */}
        <div
          className="absolute bottom-0 w-full h-44 sm:h-56 border-t-2 border-amber-500/20"
          style={{
            background:
              'linear-gradient(180deg, rgba(30, 27, 46, 0.95) 0%, rgba(15, 12, 25, 0.98) 100%)',
            boxShadow: 'inset 0 10px 40px rgba(0,0,0,0.9)',
          }}
        />

        {/* Bệ đá tròn trung tâm nâng đỡ nhân vật */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-28 sm:h-36 flex items-center justify-center">
          <div className="w-full h-full rounded-full border-4 border-amber-400/40 bg-gradient-to-b from-slate-800/80 to-slate-950 shadow-[0_10px_35px_rgba(0,0,0,0.9)] transform -rotate-x-60" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. THANH TIÊU ĐỀ TRÊN CÙNG (TOP HEADER HUD NHƯ ẢNH 1) */}
      {/* ======================================================== */}
      <header className="relative z-30 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md">
        {/* NHÓM NÚT TRÁI: CÀI ĐẶT - BÁCH KHOA - HỒ SƠ (CÁC NÚT TRÒN ĐỎ NÂU Y HỆT ẢNH 1) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Nút Cài đặt (Bánh răng) */}
          <button
            type="button"
            onClick={() => onOpenModal('settings')}
            title="Cài đặt hệ thống & âm thanh"
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-rose-600 to-rose-900 border-2 border-amber-400/80 shadow-[0_4px_12px_rgba(225,29,72,0.5)] flex items-center justify-center text-amber-200 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Nút Bách khoa / Nhiệm vụ (Cuốn sách) */}
          <button
            type="button"
            onClick={() => onOpenModal('badges')}
            title="Thư viện & Bách khoa huân chương"
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-amber-600 to-amber-900 border-2 border-amber-300/80 shadow-[0_4px_12px_rgba(217,119,6,0.5)] flex items-center justify-center text-amber-100 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Nút Hồ sơ cá nhân (Người) */}
          <button
            type="button"
            onClick={() => onOpenModal('profile')}
            title="Hồ sơ sinh viên kinh tế"
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-indigo-600 to-indigo-950 border-2 border-indigo-400/80 shadow-[0_4px_12px_rgba(79,70,229,0.5)] flex items-center justify-center text-indigo-100 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* LOGO CHÍNH: LÁ CỜ VIỆT NAM 🇻🇳 & THƯƠNG HIỆU KINH TẾ CHÍNH TRỊ */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            {/* Lá cờ đỏ sao vàng Việt Nam tung bay */}
            <div className="relative w-8 h-6 sm:w-10 sm:h-7 rounded border border-amber-300 shadow-lg overflow-hidden flex items-center justify-center bg-red-600">
              <svg viewBox="0 0 30 20" className="w-full h-full">
                <rect width="30" height="20" fill="#da251d" />
                <polygon
                  points="15,4 16.8,9.5 22.5,9.5 17.9,12.8 19.6,18.3 15,15 10.4,18.3 12.1,12.8 7.5,9.5 13.2,9.5"
                  fill="#ff0"
                />
              </svg>
            </div>

            {/* Typography tiêu đề game hoành tráng */}
            <div className="flex flex-col items-start leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent drop-shadow">
                  NHÓM 2
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-amber-200 border border-amber-400 font-black uppercase tracking-widest shadow-sm">
                  VIỆT NAM
                </span>
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-amber-400/90 tracking-widest uppercase">
                KINH TẾ THỊ TRƯỜNG ĐỊNH HƯỚNG XHCN
              </span>
            </div>
          </div>
        </div>

        {/* NÚT PLAY XANH LÁ TRÒN TO (BẤM ĐỂ CHỌN TƯỚNG & CHỈNH AVATAR) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCharacterCreation();
            }}
            title="Bấm để sang bước chọn tướng & chỉnh avatar!"
            className="group relative flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            {/* Vòng sáng nhấp nháy thu hút ánh nhìn */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/40 blur-md group-hover:bg-emerald-400/60 animate-ping" style={{ animationDuration: '2.5s' }} />

            {/* Nút tròn màu xanh lá cây rực rỡ như ảnh 1 */}
            <div className="relative w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-lime-400 via-emerald-500 to-green-800 border-3 sm:border-4 border-lime-200 shadow-[0_4px_25px_rgba(34,197,94,0.8)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-0 h-0 border-t-[8px] sm:border-t-[12px] border-t-transparent border-b-[8px] sm:border-b-[12px] border-b-transparent border-l-[14px] sm:border-l-[20px] border-l-white ml-1 filter drop-shadow" />
            </div>
          </button>

          {/* Ô SAO TRI THỨC VÀNG (NHƯ Ô 70 SAO Ở ẢNH 1) */}
          <div className="flex items-center gap-1 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 border-2 border-amber-400/60 shadow-lg text-amber-300">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <div className="flex flex-col leading-none">
              <span className="text-xs sm:text-sm font-black tracking-wider">
                {totalStars}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-amber-400/70 font-bold">
                TRI THỨC
              </span>
            </div>
          </div>

          {/* Ô VỐN KINH TẾ (TIỀN ĐỒNG VIỆT NAM) */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border-2 border-emerald-500/50 shadow-lg text-emerald-300">
            <Coins className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black text-emerald-300">
                {(economyCoins / 1000000).toFixed(0)}M ₫
              </span>
              <span className="text-[8px] uppercase tracking-wider text-emerald-400/70 font-bold">
                VỐN ĐẦU TƯ
              </span>
            </div>
          </div>

          {/* Nút Toàn Màn Hình */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. KHU VỰC THÂN TRUNG TÂM: 3 CỘT (TRÁI - GIỮA - PHẢI) */}
      {/* ======================================================== */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-4">
        {/* ---------------------------------------------------- */}
        {/* CỘT TRÁI: VŨ KHÍ LÝ LUẬN & CHỈ SỐ SINH TỒN (NHƯ ẢNH 1) */}
        {/* ---------------------------------------------------- */}
        <div className="flex flex-col gap-2.5 sm:gap-3 shrink-0 z-20">
          {/* THẺ SÁCH "TƯ BẢN LUẬN" (TƯƠNG ĐƯƠNG SÚNG SVD BASIC Ở ẢNH 1) */}
          <div className="relative bg-slate-900/95 border-2 border-slate-700 hover:border-amber-400 p-2.5 sm:p-3 rounded-2xl shadow-2xl w-36 sm:w-48 backdrop-blur-md group transition-all">
            {/* Bong bóng mũi tên chỉ về phía nhân vật */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-slate-700 group-hover:border-l-amber-400 transition-colors" />

            <div className="flex flex-col items-center text-center">
              {/* Ảnh cuốn sách Tư Bản Luận với hào quang đỏ vàng */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-red-950 via-red-900 to-amber-950 border-2 border-amber-400/60 flex items-center justify-center p-2 shadow-inner my-1">
                <span className="text-3xl sm:text-4xl filter drop-shadow">📕</span>
                <span className="absolute bottom-1 right-1 text-[9px] bg-red-600 text-amber-200 px-1 rounded font-black border border-amber-400">
                  VOL 1
                </span>
              </div>

              <span className="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-wider mt-1 truncate w-full">
                TƯ BẢN LUẬN
              </span>
              <span className="text-[9px] text-slate-400 font-bold">
                Vũ Khí Lý Luận Cơ Bản
              </span>
            </div>
          </div>

          {/* CHỈ SỐ SỨC SỐNG HP: GIỌT MÁU ĐỎ 100 (NHƯ ẢNH 1) */}
          <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-slate-700 px-3 py-1.5 rounded-xl shadow-lg w-32 sm:w-36">
            <div className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-500 font-black text-sm">
              🩸
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs sm:text-sm font-black text-rose-400">100 / 100</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">SỨC SỐNG</span>
            </div>
          </div>

          {/* CHỈ SỐ LƯỢT GIẢI CỨU: ĐỒNG HỒ 3 (NHƯ ẢNH 1) */}
          <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-slate-700 px-3 py-1.5 rounded-xl shadow-lg w-32 sm:w-36">
            <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500 flex items-center justify-center text-cyan-400 font-black text-sm">
              ⏱️
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs sm:text-sm font-black text-cyan-300">3 LƯỢT</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">CƠ HỘI CỨU</span>
            </div>
          </div>

          {/* KỸ NĂNG HUY HIỆU ĐOÀN x12 (NHƯ QUẢ LỰU ĐẠN x12 Ở ẢNH 1) */}
          <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-slate-700 px-3 py-1.5 rounded-xl shadow-lg w-32 sm:w-36">
            <div className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400 font-black text-sm">
              ⭐
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs sm:text-sm font-black text-emerald-300">x12</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">LUẬN ĐIỂM</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CỘT GIỮA: SÂN KHẤU NHÂN VẬT PIXEL ART (ẢNH 2) & ĐIỀU HƯỚNG */}
        {/* ---------------------------------------------------- */}
        <div className="relative flex-1 flex flex-col items-center justify-center py-2 z-20">
          <div className="relative flex items-center justify-center gap-4 sm:gap-8">
            {/* Nút chuyển nhân vật trước đó bên trái (<) */}
            <button
              type="button"
              onClick={handlePrevHero}
              title="Nhân vật trước"
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-400/80 text-amber-300 flex items-center justify-center shadow-2xl active:scale-90 transition-all cursor-pointer z-30"
            >
              <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>

            {/* Render Nhân vật Pixel Art y hệt Ảnh 2 với Hộp Tên Vàng & Mũi Tên Đỏ */}
            <div className="relative flex flex-col items-center">
              <PixelCharacterHero
                appearance={progress.appearance}
                size={180}
                playerName={progress.playerName}
                showNameTag={true}
                showShadow={true}
                showPrompt={true}
                promptLabel="Chọn Tướng & Tạo Hình Avatar"
                onPromptClick={() => {
                  sound.playClick();
                  onOpenCharacterCreation();
                }}
              />
            </div>

            {/* Nút chuyển nhân vật kế tiếp bên phải (>) */}
            <button
              type="button"
              onClick={handleNextHero}
              title="Nhân vật kế tiếp"
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-400/80 text-amber-300 flex items-center justify-center shadow-2xl active:scale-90 transition-all cursor-pointer z-30"
            >
              <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CỘT PHẢI: CHIẾC BÁNH KINH TẾ VIỆT NAM (THAY THẾ TOÀN BỘ CÁC HÒM THỊ TRƯỜNG, VIỆN TRỢ, KHO BÁU XHCN) */}
        {/* ---------------------------------------------------- */}
        <div className="shrink-0 z-20 flex flex-col items-center">
          <VietnamEconomicPieCard />
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. THANH ĐIỀU KHIỂN DƯỚI CÙNG (BOTTOM HERO BAR NHƯ ẢNH 1) */}
      {/* ======================================================== */}
      <footer className="relative z-30 px-3 sm:px-6 py-2.5 bg-slate-950/90 border-t border-amber-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Phiên bản game góc trái dưới cùng (như v1.1.0 ở ảnh 1) */}
        <div className="hidden md:flex flex-col text-[10px] text-slate-400 font-mono">
          <span className="font-bold text-amber-400">v1.2.0 • KINH TẾ CHÍNH TRỊ VN • NHÓM 2</span>
          <span>© Bản quyền Học Viện Cải Cách</span>
        </div>

        {/* THANH ĐIỀU KHIỂN HERO & CHỌN TÊN (Y HỆT HỘP CHEEZIT Ở ẢNH 1) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mx-auto">
          {/* Nút đỏ mũi tên trái (<) */}
          <button
            type="button"
            onClick={handlePrevHero}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-rose-600 to-rose-900 border-2 border-rose-400 text-rose-100 flex items-center justify-center font-black text-lg active:scale-95 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Hộp thông tin nhân vật chính: Cấp độ, Tên tự chọn, Thanh EXP */}
          <div className="bg-slate-900 border-2 border-slate-700 px-3 py-1.5 sm:px-5 sm:py-2 rounded-2xl shadow-2xl flex flex-col items-center min-w-[220px] sm:min-w-[280px]">
            {/* Chức danh & Cấp độ */}
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-black uppercase tracking-wider mb-1">
              <span>👁️ {currentArchetype.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400 text-amber-300">
                LVL 1
              </span>
            </div>

            {/* Ô TỰ DO CHỈNH TÊN NGAY TRÊN SẢNH CHỜ (KHÔNG ÉP TUẤN KIỆT) */}
            <div className="flex items-center gap-1.5 my-1 bg-slate-950/90 px-2.5 py-1 rounded-xl border-2 border-amber-400/80 focus-within:border-amber-300 shadow-inner w-full max-w-[250px]">
              <span className="text-[10px] sm:text-xs font-black text-amber-400 whitespace-nowrap">Tên:</span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setNameInput(val);
                  onUpdatePlayer({ playerName: val.trim() || 'Nhà Cải Cách' });
                }}
                maxLength={20}
                placeholder="Nhập tên của bạn..."
                className="flex-1 bg-transparent border-none text-xs sm:text-sm font-black text-amber-100 focus:outline-none text-center"
              />
              <button
                type="button"
                onClick={handleRandomName}
                title="Đổi tên ngẫu nhiên (không lấy Tuấn Kiệt)"
                className="text-amber-400 hover:text-amber-200 cursor-pointer p-0.5 transition-transform hover:rotate-180 duration-300"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>

            {/* Thanh Máu / EXP Xanh Lá Rực Rỡ 360 (y hệt ảnh 1) */}
            <div className="w-full h-3 sm:h-3.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden relative mt-1 flex items-center justify-center">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-lime-400 to-emerald-500 shadow-sm"
                style={{ width: '72%' }}
              />
              <span className="relative z-10 text-[9px] sm:text-[10px] font-black text-slate-950 tracking-wider">
                360 / 500 EXP
              </span>
            </div>
          </div>

          {/* Nút đỏ mũi tên phải (>) */}
          <button
            type="button"
            onClick={handleNextHero}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-rose-600 to-rose-900 border-2 border-rose-400 text-rose-100 flex items-center justify-center font-black text-lg active:scale-95 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* NÚT MŨI TÊN CHÍNH TIẾP TỤC: SANG MÀN HÌNH CHỌN TƯỚNG & AVATAR (ẢNH 1 STYLE) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCharacterCreation();
            }}
            className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 border-2 border-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(251,191,36,0.6)] active:scale-95 transition-all cursor-pointer animate-pulse"
            title="Ấn mũi tên để sang màn hình chọn tướng & chỉnh avatar"
          >
            <span>CHỌN TƯỚNG & AVATAR</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </footer>

    </div>
  );
};
