import React, { useState, useEffect, useRef } from 'react';
import { Zap, CornerDownLeft, Compass } from 'lucide-react';
import { EventBus } from '../game/EventBus';

export const VirtualDPad: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [currentDir, setCurrentDir] = useState<string>('stop');

  const baseRef = useRef<HTMLDivElement>(null);
  const activeDirRef = useRef<string>('stop');
  const touchIdRef = useRef<number | null>(null);

  const MAX_RADIUS = 44; // Bán kính kéo tối đa của núm joystick (px)
  const DEADZONE = 10;   // Vùng chết ở tâm

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

  const updateDirection = (newDir: string) => {
    if (activeDirRef.current !== newDir) {
      activeDirRef.current = newDir;
      setCurrentDir(newDir);
      if (newDir !== 'stop') {
        triggerHaptic();
      }
      EventBus.emit('virtual-dpad-move', { dir: newDir });
    }
  };

  // Tính toán vị trí núm và góc xoay 8 hướng chuẩn Liên Quân Mobile
  const processCoords = (clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < DEADZONE) {
      setKnobPos({ x: 0, y: 0 });
      updateDirection('stop');
      return;
    }

    // Giới hạn bán kính di chuyển của núm
    const angleRad = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, MAX_RADIUS);
    const knobX = Math.cos(angleRad) * clampedDist;
    const knobY = Math.sin(angleRad) * clampedDist;
    setKnobPos({ x: knobX, y: knobY });

    // Xác định 8 hướng di chuyển (-180 đến 180 độ)
    const angleDeg = (angleRad * 180) / Math.PI;

    if (angleDeg >= -22.5 && angleDeg < 22.5) {
      updateDirection('right');
    } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
      updateDirection('down-right');
    } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
      updateDirection('down');
    } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
      updateDirection('down-left');
    } else if (angleDeg >= 157.5 || angleDeg < -157.5) {
      updateDirection('left');
    } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
      updateDirection('up-left');
    } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
      updateDirection('up');
    } else if (angleDeg >= -67.5 && angleDeg < -22.5) {
      updateDirection('up-right');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (touch) {
      touchIdRef.current = touch.identifier;
      setIsDragging(true);
      processCoords(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        processCoords(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        updateDirection('stop');
        break;
      }
    }
  };

  // Hỗ trợ chuột cho kiểm thử trực tiếp trên PC
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    processCoords(e.clientX, e.clientY);

    const onMouseMove = (ev: MouseEvent) => {
      processCoords(ev.clientX, ev.clientY);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      updateDirection('stop');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAction = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic();
    EventBus.emit('virtual-action');
  };

  const toggleSprint = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic();
    const nextSprint = !isSprinting;
    setIsSprinting(nextSprint);
    EventBus.emit('virtual-sprint', { sprinting: nextSprint });
  };

  // Hiển thị trên thiết bị chạm hoặc màn hình mobile/tablet hoặc màn hình nhỏ
  if (!isTouchDevice && typeof window !== 'undefined' && window.innerWidth > 1024) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-2 z-40 pointer-events-none flex items-end justify-between px-3 sm:px-6 select-none"
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* ======================================================== */}
      {/* 1. CẦN GẠT ANALOG JOYSTICK LIÊN QUÂN MOBILE (BÊN TAY TRÁI) */}
      {/* ======================================================== */}
      <div className="pointer-events-auto relative touch-none select-none">
        {/* Vòng đế Joystick Liên Quân Mobile */}
        <div
          ref={baseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center cursor-pointer transition-shadow ${
            isDragging
              ? 'bg-slate-950/75 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.45)]'
              : 'bg-slate-950/60 border-2 border-slate-700/80 shadow-2xl'
          } backdrop-blur-md`}
        >
          {/* Các vạch chỉ hướng 4 phương 8 hướng phong cách MOBA */}
          <div className="absolute inset-2 rounded-full border border-slate-700/60 pointer-events-none flex items-center justify-center">
            {/* Vạch trên */}
            <div className="absolute top-1 w-1.5 h-3 rounded-full bg-slate-500/80" />
            {/* Vạch dưới */}
            <div className="absolute bottom-1 w-1.5 h-3 rounded-full bg-slate-500/80" />
            {/* Vạch trái */}
            <div className="absolute left-1 w-3 h-1.5 rounded-full bg-slate-500/80" />
            {/* Vạch phải */}
            <div className="absolute right-1 w-3 h-1.5 rounded-full bg-slate-500/80" />
          </div>

          {/* Vòng tròn định vị tâm */}
          <div className="w-12 h-12 rounded-full border border-slate-700/50 flex items-center justify-center pointer-events-none opacity-40">
            <Compass className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
          </div>

          {/* Núm xoay Thumbstick tròn chuyển động 360 độ */}
          <div
            className={`absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center pointer-events-none ${
              isDragging
                ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 border-2 border-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105'
                : 'bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-500 shadow-xl'
            }`}
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
              transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            {/* Lõi tâm phát sáng */}
            <div
              className={`w-5 h-5 rounded-full ${
                isDragging ? 'bg-slate-950/80 shadow-inner' : 'bg-amber-400/80'
              } flex items-center justify-center`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isDragging ? 'bg-amber-300 animate-ping' : 'bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Nhãn hướng di chuyển */}
        {currentDir !== 'stop' && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 border border-amber-400/60 text-[9px] font-black text-amber-300 uppercase tracking-widest shadow-md">
            {currentDir}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. CỤM NÚT KỸ NĂNG & HÀNH ĐỘNG LIÊN QUÂN (BÊN TAY PHẢI) */}
      {/* ======================================================== */}
      <div className="pointer-events-auto flex items-end gap-3 sm:gap-4 touch-none select-none">
        {/* Nút Phụ: Tốc Biến / Chạy Nhanh (Sprint) */}
        <button
          type="button"
          onTouchStart={toggleSprint}
          onMouseDown={toggleSprint}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-pointer active:scale-90 shadow-xl ${
            isSprinting
              ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-200 text-slate-950 shadow-amber-500/50'
              : 'bg-slate-900/85 border-slate-600 text-slate-300 hover:text-white'
          }`}
          aria-label="Chạy nhanh"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-[8px] font-black uppercase mt-0.5">CHẠY</span>
        </button>

        {/* Nút Chính To Bự: Đánh / Vào Cửa / Tương Tác (Attack/Action Button) */}
        <button
          type="button"
          onTouchStart={handleAction}
          onMouseDown={handleAction}
          className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 active:scale-90 text-slate-950 flex flex-col items-center justify-center font-black border-3 border-slate-900 shadow-[0_0_25px_rgba(251,191,36,0.6)] cursor-pointer transition-transform group"
          aria-label="Tương tác hoặc bước vào"
        >
          <div className="absolute inset-1 rounded-full border border-amber-600/40 pointer-events-none" />
          <CornerDownLeft className="w-7 h-7 stroke-[3] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black tracking-widest uppercase mt-0.5 drop-shadow-sm">
            VÀO
          </span>
        </button>
      </div>
    </div>
  );
};
