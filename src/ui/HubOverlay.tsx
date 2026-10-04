import React, { useEffect, useState } from 'react';
import { EventBus } from '../game/EventBus';

export const TOTAL_QUIZ_STARS = 60; // 20 màn x 3 sao
export const TOTAL_BADGES = 9; // 9 tình huống đối đầu với 9 NPC

export const HubOverlay: React.FC = () => {
  const [nearLabel, setNearLabel] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const onMove = () => {
      setHintVisible(false);
    };
    const onNear = (p: { label: string | null }) => setNearLabel(p.label);

    EventBus.on('hub-player-move', onMove);
    EventBus.on('hub-near-zone', onNear);
    return () => {
      EventBus.removeListener('hub-player-move', onMove);
      EventBus.removeListener('hub-near-zone', onNear);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Vignette tạo chiều sâu cho khung hình pixel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(3,6,14,0.55) 100%)',
        }}
      />

      {/* Bảng báo vị trí khi đứng trước cổng công trình */}
      {nearLabel && (
        <div className="absolute top-3 left-3 pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-amber-400/60 bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md shadow-xl">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Đang đứng trước: {nearLabel}
        </div>
      )}



      {/* ---------- GỢI Ý ĐIỀU KHIỂN (tự ẩn khi bắt đầu đi) ---------- */}
      <div
        className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 pointer-events-none ${
          hintVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-700/70 bg-slate-950/90 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[9.5px] sm:text-[10px] font-bold text-slate-300 backdrop-blur-md shadow-xl whitespace-nowrap">
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
              W A S D
            </kbd>
            di chuyển
            <span className="text-slate-600">•</span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
              SPACE
            </kbd>
            bước vào cửa
          </span>
          <span className="inline-flex sm:hidden items-center gap-1">
            <span>🎮 Dùng D-Pad</span>
            <span className="text-slate-600">•</span>
            <span>Bấm</span>
            <kbd className="rounded bg-amber-500/20 text-amber-300 px-1 py-0.5 text-[8.5px] font-black border border-amber-400/40">
              VÀO
            </kbd>
            <span>hoặc chạm cửa</span>
          </span>
        </div>
      </div>
    </div>
  );
};
