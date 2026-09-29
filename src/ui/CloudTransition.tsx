import React, { useEffect, useState } from 'react';
import { transitionManager, TransitionPayload } from '../systems/transition';

export const CloudTransition: React.FC = () => {
  const [transition, setTransition] = useState<TransitionPayload>(() => transitionManager.getSnapshot());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const unsub = transitionManager.subscribe((payload) => {
      setTransition(payload);
    });

    // Kiểm tra cài đặt prefers-reduced-motion của hệ thống
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', handleMediaChange);

    return () => {
      unsub();
      media.removeEventListener('change', handleMediaChange);
    };
  }, []);

  if (transition.state === 'idle') {
    return null;
  }

  const isClosing = transition.state === 'closing';
  const isHolding = transition.state === 'holding';
  const isBattle = transition.variant === 'battle';

  // Màu sắc theo biến thể: Trắng ngà nhẹ nhàng cho thường, Xám sấm sét cho trận đấu
  const cloudBg = isBattle ? 'bg-slate-900 border-amber-500/50' : 'bg-white border-slate-300';
  const cloudText = isBattle ? 'text-amber-400' : 'text-slate-800';
  const bannerBg = isBattle
    ? 'bg-slate-950 border-2 border-amber-500 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
    : 'bg-white border-2 border-slate-900 text-slate-900 shadow-[0_8px_0_rgba(15,23,42,1)]';

  // Tính toán vị trí bay của 4 cụm mây theo các góc
  // Khi closing hoặc holding: tiến vào giữa (translate(0, 0))
  // Khi opening: bung ngược trở lại ra ngoài
  const getTransform = (quadrant: 'tl' | 'tr' | 'bl' | 'br') => {
    if (reducedMotion) return 'translate-x-0 translate-y-0';
    if (isClosing || isHolding) return 'translate-x-0 translate-y-0 scale-100';

    // State opening: bay ra ngoài biên
    switch (quadrant) {
      case 'tl': return '-translate-x-full -translate-y-full scale-110';
      case 'tr': return 'translate-x-full -translate-y-full scale-110';
      case 'bl': return '-translate-x-full translate-y-full scale-110';
      case 'br': return 'translate-x-full translate-y-full scale-110';
    }
  };

  const animDuration = isBattle ? 'duration-300' : 'duration-500';

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden flex items-center justify-center transition-opacity duration-300"
      aria-live="polite"
      aria-label="Đang chuyển cảnh"
    >
      {/* 4 Khối mây khổng lồ che 4 góc */}
      {/* Góc Tây Bắc (Top-Left) */}
      <div
        className={`absolute top-0 left-0 w-[65vw] h-[65vh] rounded-br-[120px] transition-transform ${animDuration} ease-in-out ${getTransform('tl')} ${cloudBg} shadow-2xl flex items-center justify-center`}
      >
        <div className={`w-32 h-32 rounded-full absolute -right-12 -bottom-12 ${cloudBg}`} />
      </div>

      {/* Góc Đông Bắc (Top-Right) */}
      <div
        className={`absolute top-0 right-0 w-[65vw] h-[65vh] rounded-bl-[120px] transition-transform ${animDuration} ease-in-out ${getTransform('tr')} ${cloudBg} shadow-2xl`}
      >
        <div className={`w-36 h-36 rounded-full absolute -left-12 -bottom-10 ${cloudBg}`} />
      </div>

      {/* Góc Tây Nam (Bottom-Left) */}
      <div
        className={`absolute bottom-0 left-0 w-[65vw] h-[65vh] rounded-tr-[120px] transition-transform ${animDuration} ease-in-out ${getTransform('bl')} ${cloudBg} shadow-2xl`}
      >
        <div className={`w-40 h-40 rounded-full absolute -right-14 -top-12 ${cloudBg}`} />
      </div>

      {/* Góc Đông Nam (Bottom-Right) */}
      <div
        className={`absolute bottom-0 right-0 w-[65vw] h-[65vh] rounded-tl-[120px] transition-transform ${animDuration} ease-in-out ${getTransform('br')} ${cloudBg} shadow-2xl`}
      >
        <div className={`w-36 h-36 rounded-full absolute -left-10 -top-10 ${cloudBg}`} />
      </div>

      {/* Màn che mờ trung tâm khi mây chụm lại hoàn toàn */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          isHolding ? 'opacity-100' : 'opacity-0'
        } ${isBattle ? 'bg-slate-950/80' : 'bg-slate-100/60'} pointer-events-none`}
      />

      {/* Bảng nhãn hiển thị tên khu vực trong lúc giữ (Holding phase) */}
      {isHolding && (
        <div className="relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center gap-3 px-6 py-4">
          {transition.label ? (
            <div className={`px-8 py-3.5 rounded-2xl ${bannerBg} font-black text-sm sm:text-base tracking-wide flex items-center gap-3`}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>{transition.label}</span>
            </div>
          ) : (
            <div className={`px-6 py-2.5 rounded-xl ${bannerBg} text-xs font-bold`}>
              Đang tải...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
