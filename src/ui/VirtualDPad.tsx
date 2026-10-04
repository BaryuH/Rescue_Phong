import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';
import { EventBus } from '../game/EventBus';

export const VirtualDPad: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
  };

  const handleDirStart = (dir: string, e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic();
    EventBus.emit('virtual-dpad-move', { dir });
  };

  const handleDirEnd = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    EventBus.emit('virtual-dpad-move', { dir: 'stop' });
  };

  const handleAction = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic();
    EventBus.emit('virtual-action');
  };

  // Hiển thị trên thiết bị cảm ứng hoặc khi màn hình có tỉ lệ mobile landscape
  // Lưu ý: không dùng sm:hidden vì smartphone xoay ngang có width > 640px (844px, 896px...)
  if (!isTouchDevice) {
    // Trên máy tính không có cảm ứng, ẩn đi trừ khi đang ở màn hình thu nhỏ để test
    if (typeof window !== 'undefined' && window.innerWidth > 1024) {
      return null;
    }
  }

  return (
    <div
      className="fixed inset-x-0 bottom-2 z-40 pointer-events-none flex items-end justify-between px-3 sm:px-6 select-none"
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* ======================================================== */}
      {/* 1. D-PAD ĐIỀU HƯỚNG 4 CHIỀU CHO NGÓN CÁI TAY TRÁI */}
      {/* ======================================================== */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-2xl touch-none">
        <div />
        <button
          type="button"
          onTouchStart={(e) => handleDirStart('up', e)}
          onTouchEnd={handleDirEnd}
          onMouseDown={(e) => handleDirStart('up', e)}
          onMouseUp={handleDirEnd}
          className="w-10 h-10 rounded-xl bg-slate-800/90 active:bg-amber-500 text-slate-200 active:text-slate-950 flex items-center justify-center border border-slate-700 active:scale-95 shadow font-black cursor-pointer transition-transform"
          aria-label="Đi lên"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          type="button"
          onTouchStart={(e) => handleDirStart('left', e)}
          onTouchEnd={handleDirEnd}
          onMouseDown={(e) => handleDirStart('left', e)}
          onMouseUp={handleDirEnd}
          className="w-10 h-10 rounded-xl bg-slate-800/90 active:bg-amber-500 text-slate-200 active:text-slate-950 flex items-center justify-center border border-slate-700 active:scale-95 shadow font-black cursor-pointer transition-transform"
          aria-label="Đi sang trái"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700/60" />
        </div>
        <button
          type="button"
          onTouchStart={(e) => handleDirStart('right', e)}
          onTouchEnd={handleDirEnd}
          onMouseDown={(e) => handleDirStart('right', e)}
          onMouseUp={handleDirEnd}
          className="w-10 h-10 rounded-xl bg-slate-800/90 active:bg-amber-500 text-slate-200 active:text-slate-950 flex items-center justify-center border border-slate-700 active:scale-95 shadow font-black cursor-pointer transition-transform"
          aria-label="Đi sang phải"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          type="button"
          onTouchStart={(e) => handleDirStart('down', e)}
          onTouchEnd={handleDirEnd}
          onMouseDown={(e) => handleDirStart('down', e)}
          onMouseUp={handleDirEnd}
          className="w-10 h-10 rounded-xl bg-slate-800/90 active:bg-amber-500 text-slate-200 active:text-slate-950 flex items-center justify-center border border-slate-700 active:scale-95 shadow font-black cursor-pointer transition-transform"
          aria-label="Đi xuống"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* ======================================================== */}
      {/* 2. NÚT HÀNH ĐỘNG [A / TƯƠNG TÁC] CHO NGÓN CÁI TAY PHẢI */}
      {/* ======================================================== */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 touch-none">
        <button
          type="button"
          onTouchStart={(e) => handleAction(e)}
          onMouseDown={(e) => handleAction(e)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 active:scale-90 text-slate-950 flex flex-col items-center justify-center font-black text-xs border-2 border-slate-900 shadow-2xl shadow-amber-500/30 cursor-pointer transition-transform"
          aria-label="Tương tác hoặc bước vào"
        >
          <CornerDownLeft className="w-5 h-5" />
          <span className="text-[9px] font-black tracking-wider uppercase mt-0.5">VÀO</span>
        </button>
      </div>
    </div>
  );
};
