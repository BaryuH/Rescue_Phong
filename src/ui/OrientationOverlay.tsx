import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

/**
 * OrientationOverlay:
 * Không còn chặn màn hình khi người chơi cầm dọc (portrait).
 * Tự động thích ứng để người chơi thoải mái xoay ngang hoặc cầm thẳng đều chơi được mượt mà.
 */
export const OrientationOverlay: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let lastIsPortrait: boolean | null = null;

    const handleOrientationChange = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth < 1024;
      if (!isTouch && !isSmall) return;

      const currentPortrait = window.innerHeight > window.innerWidth;
      if (lastIsPortrait !== null && lastIsPortrait !== currentPortrait) {
        setToastMessage(
          currentPortrait
            ? '📱 Đã thích ứng chế độ màn hình dọc'
            : '🔄 Đã thích ứng chế độ màn hình ngang'
        );
        const timer = setTimeout(() => setToastMessage(null), 2500);
        return () => clearTimeout(timer);
      }
      lastIsPortrait = currentPortrait;
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  if (!toastMessage) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-emerald-400/60 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-md">
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span>{toastMessage}</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    </div>
  );
};
