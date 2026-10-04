import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, RotateCcw } from 'lucide-react';

export const OrientationOverlay: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Nhận diện thiết bị đang cầm dọc (chiều cao > chiều rộng)
      // Áp dụng cho màn hình cảm ứng hoặc bề ngang < 1024px
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      const portrait = window.innerHeight > window.innerWidth;

      const shouldShow = portrait && (isTouch || isSmallScreen);
      setIsPortrait(shouldShow);

      // Nếu người dùng đã tự xoay sang ngang, xóa trạng thái bỏ qua để lần sau xoay dọc lại tiếp tục nhắc
      if (!portrait) {
        setBypassed(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', checkOrientation);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, []);

  const handleRequestLandscape = async () => {
    try {
      // 1. Kích hoạt toàn màn hình để ẩn thanh địa chỉ trình duyệt
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
      // 2. Thử khóa hướng ngang nếu trình duyệt hỗ trợ Screen Orientation API
      const orientation = window.screen?.orientation as (ScreenOrientation & { lock?: (o: string) => Promise<void> }) | undefined;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape').catch(() => {});
      }
      // Bỏ qua lỗi nếu trình duyệt không hỗ trợ hoặc cần thao tác người dùng thêm
    } catch {
      // ignore
    }
  };

  if (!isPortrait || bypassed) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300"
      style={{ touchAction: 'none' }}
    >
      {/* Hiệu ứng nền pixel viền phát sáng */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Khung Icon Điện Thoại Đang Xoay Ngang */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <Smartphone className="w-12 h-12 text-emerald-400 animate-[spin_4s_ease-in-out_infinite]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-300 animate-pulse shadow-md">
          <RotateCcw className="w-4 h-4" />
        </div>
      </div>

      {/* Tiêu đề & Thông điệp */}
      <div className="max-w-xs space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[11px] font-black tracking-wider text-emerald-300 uppercase">
          <span>🎮 Trải Nghiệm Web Mobile Ngang</span>
        </div>
        <h2 className="text-lg font-black text-slate-100 tracking-wide leading-tight">
          VUI LÒNG XOAY NGANG THIẾT BỊ
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          <strong className="text-emerald-400 font-bold">Rescue Phong</strong> là game nhập vai mô phỏng thành phố pixel art được thiết kế riêng cho{' '}
          <span className="text-amber-300 font-bold">màn hình ngang (Landscape)</span> để tối ưu tầm nhìn và hệ thống phím bấm cảm ứng.
        </p>
      </div>

      {/* Các nút hành động */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        <button
          onClick={handleRequestLandscape}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Xoay Ngang & Toàn Màn Hình</span>
        </button>

        {/* Nút bỏ qua dành cho nhà phát triển / kiểm thử */}
        <button
          onClick={() => setBypassed(true)}
          className="text-[11px] text-slate-500 hover:text-slate-300 py-1 transition-colors underline cursor-pointer"
        >
          Tiếp tục ở chế độ dọc (Dành cho kiểm thử)
        </button>
      </div>
    </div>
  );
};
