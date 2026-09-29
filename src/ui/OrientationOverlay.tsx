import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export const OrientationOverlay: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Nếu chiều cao lớn hơn chiều rộng và màn hình dưới 900px -> coi là điện thoại đang cầm dọc
      const isMobilePortrait =
        window.innerHeight > window.innerWidth && window.innerWidth < 850;
      setIsPortrait(isMobilePortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-md">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mb-4 text-amber-400 animate-bounce">
        <Smartphone className="w-8 h-8 rotate-90" />
      </div>
      <h2 className="font-black text-lg text-slate-100 mb-2">
        VUI LÒNG XOAY NGANG MÀN HÌNH
      </h2>
      <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
        Rescue Phong là game phiêu lưu bản đồ thành phố pixel art được tối ưu cho màn hình ngang. Hãy xoay ngang điện thoại để có góc nhìn tốt nhất nhé!
      </p>
    </div>
  );
};
