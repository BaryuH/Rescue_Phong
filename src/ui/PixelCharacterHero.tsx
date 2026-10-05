import React, { useEffect, useRef } from 'react';
import { CharacterAppearance, DEFAULT_APPEARANCE } from '../systems/progress';
import { ARCHETYPES } from './CharacterCreationModal';

interface PixelCharacterHeroProps {
  appearance?: CharacterAppearance;
  size?: number; // Kích thước render (mặc định 200px)
  playerName?: string;
  showNameTag?: boolean;
  showShadow?: boolean;
  showPrompt?: boolean;
  promptLabel?: string;
  onPromptClick?: () => void;
  className?: string;
  animate?: boolean;
}

// Bảng màu hỗ trợ tạo sắc thái bóng / sáng cho pixel
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function adjustBrightnessRgb(rgb: { r: number; g: number; b: number }, percent: number) {
  const amt = Math.round(2.55 * percent);
  return {
    r: Math.min(255, Math.max(0, rgb.r + amt)),
    g: Math.min(255, Math.max(0, rgb.g + amt)),
    b: Math.min(255, Math.max(0, rgb.b + amt)),
  };
}

export const PixelCharacterHero: React.FC<PixelCharacterHeroProps> = ({
  appearance = DEFAULT_APPEARANCE,
  size = 200,
  playerName = 'Nhà Cải Cách',
  showNameTag = true,
  showShadow = true,
  showPrompt = true,
  promptLabel = 'Vào Đấu Trường Thể Chế',
  onPromptClick,
  className = '',
  animate = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const baseSkin = appearance.baseSkin ?? 0;
  const currentArchetype = ARCHETYPES.find((a) => a.id === baseSkin) || ARCHETYPES[0];
  const tileFile = currentArchetype.tileFile;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = `/${tileFile}`;
    img.onload = () => {
      // 1. Vẽ tile gốc lên canvas 16x16
      ctx.clearRect(0, 0, 16, 16);
      ctx.drawImage(img, 0, 0, 16, 16);

      // Đọc dữ liệu điểm ảnh (ImageData) để tùy chỉnh pixel
      const imgData = ctx.getImageData(0, 0, 16, 16);
      const data = imgData.data;

      const setPixel = (x: number, y: number, r: number, g: number, b: number, a = 255) => {
        if (x < 0 || x >= 16 || y < 0 || y >= 16) return;
        const idx = (y * 16 + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
      };

      const getPixel = (x: number, y: number) => {
        if (x < 0 || x >= 16 || y < 0 || y >= 16) return { r: 0, g: 0, b: 0, a: 0 };
        const idx = (y * 16 + x) * 4;
        return {
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          a: data[idx + 3],
        };
      };

      // 2. Tùy chỉnh màu da (Skin tone) nếu có
      if (appearance.skinTone) {
        const targetSkin = hexToRgb(appearance.skinTone);
        const skinShadow = adjustBrightnessRgb(targetSkin, -20);
        const skinHighlight = adjustBrightnessRgb(targetSkin, 15);

        for (let y = 6; y <= 12; y++) {
          for (let x = 3; x <= 12; x++) {
            const p = getPixel(x, y);
            // Phát hiện các pixel da (màu vàng/cam/hồng da người của Kenney)
            if (p.a > 200 && p.r > 200 && p.g > 140 && p.b > 110 && !(x >= 6 && x <= 9 && (y === 7 || y === 8) && p.r < 120)) {
              if (p.r > 240) {
                setPixel(x, y, skinHighlight.r, skinHighlight.g, skinHighlight.b);
              } else if (p.g < 180) {
                setPixel(x, y, skinShadow.r, skinShadow.g, skinShadow.b);
              } else {
                setPixel(x, y, targetSkin.r, targetSkin.g, targetSkin.b);
              }
            }
          }
        }
      }

      // 3. Tùy chỉnh Tóc (Hair Style & Hair Color)
      if (appearance.hairColor) {
        const targetHair = hexToRgb(appearance.hairColor);
        const hairShadow = adjustBrightnessRgb(targetHair, -30);
        const hairHighlight = adjustBrightnessRgb(targetHair, 30);

        // Đổi màu các pixel tóc có sẵn (hàng 2..6)
        for (let y = 2; y <= 6; y++) {
          for (let x = 3; x <= 12; x++) {
            const p = getPixel(x, y);
            // Kiểm tra pixel tóc (không phải da mặt ở giữa hàng 6)
            if (p.a > 200 && !(y === 6 && x >= 5 && x <= 10)) {
              if (p.r < 150 && p.g < 90 && p.b < 75) {
                setPixel(x, y, hairShadow.r, hairShadow.g, hairShadow.b);
              } else if (p.r > 210) {
                setPixel(x, y, hairHighlight.r, hairHighlight.g, hairHighlight.b);
              } else {
                setPixel(x, y, targetHair.r, targetHair.g, targetHair.b);
              }
            }
          }
        }

        // Vẽ thêm chi tiết theo Kiểu Tóc (hairStyle)
        if (appearance.hairStyle === 'spiky') {
          // Tóc vuốt nhọn dựng lên hàng 1
          setPixel(5, 1, targetHair.r, targetHair.g, targetHair.b);
          setPixel(7, 0, hairHighlight.r, hairHighlight.g, hairHighlight.b);
          setPixel(7, 1, targetHair.r, targetHair.g, targetHair.b);
          setPixel(9, 1, targetHair.r, targetHair.g, targetHair.b);
          setPixel(10, 1, hairShadow.r, hairShadow.g, hairShadow.b);
        } else if (appearance.hairStyle === 'undercut') {
          // Đỉnh phồng cao ở giữa, hai bên cạo gọn
          setPixel(6, 1, hairHighlight.r, hairHighlight.g, hairHighlight.b);
          setPixel(7, 1, hairHighlight.r, hairHighlight.g, hairHighlight.b);
          setPixel(8, 1, targetHair.r, targetHair.g, targetHair.b);
          setPixel(9, 1, hairShadow.r, hairShadow.g, hairShadow.b);
        } else if (appearance.hairStyle === 'bob') {
          // Tóc Bob ngang vai kéo dài xuống hàng 7, 8 hai bên má
          setPixel(3, 7, targetHair.r, targetHair.g, targetHair.b);
          setPixel(3, 8, hairShadow.r, hairShadow.g, hairShadow.b);
          setPixel(12, 7, targetHair.r, targetHair.g, targetHair.b);
          setPixel(12, 8, hairShadow.r, hairShadow.g, hairShadow.b);
        } else if (appearance.hairStyle === 'long_wavy') {
          // Tóc dài qua vai đến ngực (hàng 7..10)
          setPixel(3, 7, targetHair.r, targetHair.g, targetHair.b);
          setPixel(3, 8, targetHair.r, targetHair.g, targetHair.b);
          setPixel(2, 9, hairShadow.r, hairShadow.g, hairShadow.b);
          setPixel(3, 10, hairShadow.r, hairShadow.g, hairShadow.b);
          setPixel(12, 7, targetHair.r, targetHair.g, targetHair.b);
          setPixel(12, 8, targetHair.r, targetHair.g, targetHair.b);
          setPixel(13, 9, hairShadow.r, hairShadow.g, hairShadow.b);
          setPixel(12, 10, hairShadow.r, hairShadow.g, hairShadow.b);
        } else if (appearance.hairStyle === 'ponytail') {
          // Nơ buộc tóc & đuôi ngựa lệch bên phải
          setPixel(13, 4, 236, 72, 153); // Nơ hồng
          setPixel(14, 4, targetHair.r, targetHair.g, targetHair.b);
          setPixel(14, 5, targetHair.r, targetHair.g, targetHair.b);
          setPixel(14, 6, hairShadow.r, hairShadow.g, hairShadow.b);
        } else if (appearance.hairStyle === 'curly') {
          // Tóc uốn xoăn bồng bềnh
          setPixel(4, 2, hairHighlight.r, hairHighlight.g, hairHighlight.b);
          setPixel(8, 1, hairHighlight.r, hairHighlight.g, hairHighlight.b);
          setPixel(11, 2, hairShadow.r, hairShadow.g, hairShadow.b);
          setPixel(2, 6, targetHair.r, targetHair.g, targetHair.b);
          setPixel(13, 6, targetHair.r, targetHair.g, targetHair.b);
        }
      }

      // 4. Tùy chỉnh Đôi Mắt (Eye Style & Eye Color)
      // Mắt mặc định tại (6, 7..8) và (9, 7..8)
      const targetEyeColor = hexToRgb(appearance.eyeColor || '#2a1810');
      if (appearance.eyeStyle === 'sunglasses') {
        // Kính râm cực ngầu bao phủ hàng 7 và 8
        for (let x = 5; x <= 10; x++) {
          setPixel(x, 7, 30, 41, 59);
          setPixel(x, 8, 15, 23, 42);
        }
        // Vệt phản quang trắng trên kính râm
        setPixel(5, 7, 255, 255, 255, 200);
        setPixel(8, 7, 255, 255, 255, 200);
      } else if (appearance.eyeStyle === 'glasses') {
        // Kính cận tri thức viền xanh lam ngọc
        setPixel(5, 7, 56, 189, 248);
        setPixel(6, 7, targetEyeColor.r, targetEyeColor.g, targetEyeColor.b);
        setPixel(6, 8, 56, 189, 248);
        setPixel(7, 7, 56, 189, 248); // Cầu nối kính
        setPixel(8, 7, 56, 189, 248);
        setPixel(9, 7, targetEyeColor.r, targetEyeColor.g, targetEyeColor.b);
        setPixel(9, 8, 56, 189, 248);
        setPixel(10, 7, 56, 189, 248);
        // Đốm sáng phản chiếu kính
        setPixel(5, 6, 255, 255, 255);
        setPixel(9, 6, 255, 255, 255);
      } else if (appearance.eyeStyle === 'happy') {
        // Mắt cười híp tít (^ ^)
        const skinP = hexToRgb(appearance.skinTone || '#ffc999');
        setPixel(6, 7, 30, 24, 16);
        setPixel(6, 8, skinP.r, skinP.g, skinP.b);
        setPixel(9, 7, 30, 24, 16);
        setPixel(9, 8, skinP.r, skinP.g, skinP.b);
        setPixel(5, 8, 30, 24, 16);
        setPixel(10, 8, 30, 24, 16);
      } else if (appearance.eyeStyle === 'sharp') {
        // Ánh mắt sắc bén
        setPixel(6, 7, targetEyeColor.r, targetEyeColor.g, targetEyeColor.b);
        setPixel(6, 8, 30, 24, 16);
        setPixel(9, 7, targetEyeColor.r, targetEyeColor.g, targetEyeColor.b);
        setPixel(9, 8, 30, 24, 16);
        setPixel(5, 6, 40, 20, 20); // Lông mày sắc
        setPixel(10, 6, 40, 20, 20);
      } else {
        // Mắt thường / tinh anh: đốm sáng trắng phản chiếu
        setPixel(6, 7, targetEyeColor.r, targetEyeColor.g, targetEyeColor.b);
        setPixel(6, 8, 20, 15, 10);
        setPixel(9, 7, targetEyeColor.r, targetEyeColor.g, targetEyeColor.b);
        setPixel(9, 8, 20, 15, 10);
        setPixel(6, 7, 255, 255, 255); // Ánh sáng lấp lánh
        setPixel(9, 7, 255, 255, 255);
      }

      // 5. Tùy chỉnh Miệng & Nụ cười (Mouth Style) tại hàng 9
      if (appearance.mouthStyle === 'grin') {
        // Cười tươi hở răng trắng
        setPixel(7, 9, 255, 255, 255); // Răng
        setPixel(8, 9, 255, 255, 255);
        setPixel(7, 10, 185, 28, 28); // Khóe miệng
        setPixel(8, 10, 185, 28, 28);
      } else if (appearance.mouthStyle === 'confident') {
        // Cười nhếch mép tự tin
        setPixel(7, 9, 185, 28, 28);
        setPixel(8, 9, 185, 28, 28);
        setPixel(9, 8, 185, 28, 28);
      } else if (appearance.mouthStyle === 'serious') {
        // Nghiêm túc, thẳng tắp
        setPixel(7, 9, 140, 40, 40);
        setPixel(8, 9, 140, 40, 40);
      } else if (appearance.mouthStyle === 'straw') {
        // Ngậm cọng cỏ xanh phong trần
        setPixel(7, 9, 185, 28, 28);
        setPixel(8, 9, 185, 28, 28);
        setPixel(9, 10, 34, 197, 94); // Thân cọng cỏ
        setPixel(10, 11, 22, 163, 74);
        setPixel(11, 11, 74, 222, 128); // Đầu lá cỏ
      } else if (appearance.mouthStyle === 'mask') {
        // Khẩu trang y tế văn minh bảo vệ sức khỏe
        for (let y = 8; y <= 9; y++) {
          for (let x = 6; x <= 9; x++) {
            setPixel(x, y, 241, 245, 249);
          }
        }
        setPixel(5, 8, 203, 213, 225); // Dây đeo tai
        setPixel(10, 8, 203, 213, 225);
      } else {
        // Cười mỉm thân thiện (smile)
        setPixel(7, 9, 185, 28, 28);
        setPixel(8, 9, 185, 28, 28);
      }

      // 6. Phụ kiện đặc biệt (Accessory)
      if (appearance.accessory === 'headband') {
        // Băng đô cờ đỏ sao vàng trên trán (hàng 4)
        for (let x = 4; x <= 11; x++) {
          setPixel(x, 4, 220, 38, 38); // Đỏ
        }
        setPixel(7, 4, 250, 204, 21); // Ngôi sao vàng
        setPixel(8, 4, 250, 204, 21);
      } else if (appearance.accessory === 'headphones') {
        // Tai nghe công nghệ hai bên tai
        setPixel(2, 6, 6, 182, 212);
        setPixel(2, 7, 6, 182, 212);
        setPixel(13, 6, 6, 182, 212);
        setPixel(13, 7, 6, 182, 212);
        // Vòng quàng cổ
        setPixel(5, 10, 30, 41, 59);
        setPixel(10, 10, 30, 41, 59);
      } else if (appearance.accessory === 'badge') {
        // Huy hiệu Đoàn / Ngôi sao đỏ trên ngực áo
        setPixel(6, 11, 220, 38, 38);
        setPixel(6, 11, 250, 204, 21);
      } else if (appearance.accessory === 'blush') {
        // Đôi má hồng xinh xắn
        setPixel(5, 8, 244, 63, 94);
        setPixel(10, 8, 244, 63, 94);
      }

      // 7. Cà vạt đỏ cho Cán bộ (Archetype 2)
      if (baseSkin === 2) {
        setPixel(7, 11, 225, 29, 72);
        setPixel(8, 11, 225, 29, 72);
        setPixel(7, 12, 225, 29, 72);
        setPixel(8, 12, 225, 29, 72);
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [appearance, baseSkin, tileFile]);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, minHeight: size + 60 }}
    >
      {/* ======================================================== */}
      {/* 1. NAMETAG VÀ MŨI TÊN ĐỎ CHỈ XUỐNG (Y HỆT ẢNH 2) */}
      {/* ======================================================== */}
      {showNameTag && (
        <div
          onClick={onPromptClick}
          className={`flex flex-col items-center mb-1 z-20 transition-transform hover:scale-105 ${
            onPromptClick ? 'cursor-pointer' : 'pointer-events-none'
          }`}
          title={onPromptClick ? 'Bấm chuột hoặc ấn SPACE để chọn tướng & đổi tên avatar' : undefined}
        >
          {/* Mũi tên đỏ tam giác chỉ xuống (như ảnh 2) */}
          <div
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500 mb-1 drop-shadow-sm animate-bounce"
            style={{ animationDuration: '1.2s' }}
          />

          {/* Hộp tên nền kem viền vàng, chữ đen đậm (y hệt ảnh 2) */}
          <div className="bg-[#fef08a] border-2 border-[#eab308] px-3.5 py-0.5 rounded-[4px] shadow-[0_3px_10px_rgba(0,0,0,0.6)] flex items-center justify-center">
            <span
              className="text-xs sm:text-sm font-black text-slate-950 tracking-wide whitespace-nowrap"
              style={{
                fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
                textShadow: '0 1px 1px rgba(255,255,255,0.8)',
              }}
            >
              {playerName || 'Nhà Cải Cách'}
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. NHÂN VẬT PIXEL ART TRÊN ĐẾ SHADOW (ẢNH 2) */}
      {/* ======================================================== */}
      <div
        onClick={onPromptClick}
        className={`relative flex items-center justify-center ${
          onPromptClick ? 'cursor-pointer group' : ''
        }`}
        title={onPromptClick ? 'Bấm chuột hoặc ấn SPACE để chọn tướng & đổi tên avatar' : undefined}
      >
        {/* Hào quang nền nhẹ phía sau */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
          style={{ background: appearance.outfitColor || '#3b82f6' }}
        />

        {/* Bóng đen hình bầu dục dưới chân (y hệt ảnh 2) */}
        {showShadow && (
          <div
            className="absolute -bottom-2 w-[70%] h-6 bg-black/55 rounded-full blur-[1px] pointer-events-none"
            style={{
              transform: 'scaleY(0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.7)',
            }}
          />
        )}

        {/* Canvas pixel 16x16 render siêu nét bằng CSS pixelated */}
        <canvas
          ref={canvasRef}
          width={16}
          height={16}
          className={`relative z-10 transition-transform ${
            animate ? 'animate-pulse hover:scale-105' : 'hover:scale-105'
          }`}
          style={{
            width: size,
            height: size,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* 3. BĂNG CHỮ PROMPT BÊN DƯỚI (Y HỆT ẢNH 2) */}
      {/* [SPACE] Vào Đấu Trường Thể Chế... */}
      {/* ======================================================== */}
      {showPrompt && (
        <button
          type="button"
          onClick={onPromptClick}
          className="mt-3 group cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 bg-slate-950/95 border-2 border-slate-700 hover:border-amber-400 px-3 py-1.5 rounded-lg shadow-xl shadow-black/80 hover:shadow-amber-500/30"
          title="Bấm chuột hoặc ấn phím SPACE trên bàn phím"
        >
          <span className="bg-[#fef08a] text-slate-950 px-2 py-0.5 rounded text-[10px] sm:text-xs font-black tracking-wider uppercase border border-amber-500 shadow-sm group-hover:bg-amber-300">
            SPACE
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
            {promptLabel}
          </span>
        </button>
      )}
    </div>
  );
};
