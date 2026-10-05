import React from 'react';
import { CharacterAppearance, DEFAULT_APPEARANCE } from '../systems/progress';

interface CharacterAvatarProps {
  appearance?: Partial<CharacterAppearance>;
  size?: number | string;
  className?: string;
  animate?: boolean;
  showAura?: boolean;
}

// Bảng màu tạo sắc thái cho các chi tiết
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  appearance: customAppearance,
  size = 120,
  className = '',
  animate = true,
  showAura = false,
}) => {
  const appearance: CharacterAppearance = {
    ...DEFAULT_APPEARANCE,
    ...(customAppearance || {}),
  };

  const {
    faceShape,
    skinTone,
    hairStyle,
    hairColor,
    eyeStyle,
    eyeColor,
    mouthStyle,
    accessory,
    outfitColor = '#3b82f6',
    baseSkin,
  } = appearance;

  const skinShadow = adjustBrightness(skinTone, -20);
  const hairHighlight = adjustBrightness(hairColor, 28);
  const hairShadow = adjustBrightness(hairColor, -25);
  const outfitShadow = adjustBrightness(outfitColor, -25);

  // Chọn hình dáng cằm/khuôn mặt
  let facePath = 'M 35 48 C 35 78, 65 78, 65 48 C 65 30, 35 30, 35 48 Z';
  if (faceShape === 'round') {
    facePath = 'M 33 46 C 33 79, 67 79, 67 46 C 67 28, 33 28, 33 46 Z';
  } else if (faceShape === 'square') {
    facePath = 'M 34 46 C 34 72, 38 78, 50 78 C 62 78, 66 72, 66 46 C 66 30, 34 30, 34 46 Z';
  } else if (faceShape === 'sharp') {
    facePath = 'M 35 45 C 35 68, 48 81, 50 81 C 52 81, 65 68, 65 45 C 65 28, 35 28, 35 45 Z';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {showAura && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse pointer-events-none"
          style={{ background: outfitColor }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
        style={{ imageRendering: 'auto' }}
      >
        <defs>
          <radialGradient id={`skinGlow-${skinTone}`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor={adjustBrightness(skinTone, 10)} />
            <stop offset="100%" stopColor={skinTone} />
          </radialGradient>
          <linearGradient id={`hairShine-${hairColor.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hairHighlight} />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor={hairShadow} />
          </linearGradient>
          <linearGradient id={`shadesGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* 1. TÓC PHÍA SAU (cho tóc dài, búi, xoăn) */}
        {(hairStyle === 'long_wavy' || hairStyle === 'ponytail' || hairStyle === 'curly') && (
          <g fill={hairShadow}>
            {hairStyle === 'long_wavy' && (
              <path d="M 28 42 C 20 60, 22 88, 32 94 C 36 86, 34 68, 35 55 L 65 55 C 66 68, 64 86, 68 94 C 78 88, 80 60, 72 42 Z" />
            )}
            {hairStyle === 'ponytail' && (
              <path d="M 64 36 C 76 34, 82 46, 80 62 C 78 68, 74 65, 73 55 C 71 47, 68 44, 64 42 Z" />
            )}
            {hairStyle === 'curly' && (
              <path d="M 26 44 C 20 58, 24 82, 34 86 C 35 72, 34 60, 36 52 L 64 52 C 66 60, 65 72, 66 86 C 76 82, 80 58, 74 44 Z" />
            )}
          </g>
        )}

        {/* 2. CỔ & THÂN ÁO / TRANG PHỤC */}
        <g>
          {/* Cổ áo */}
          <path d="M 44 68 L 56 68 L 58 80 L 42 80 Z" fill={skinShadow} />
          <path d="M 45 70 L 55 70 L 56 78 L 44 78 Z" fill={skinTone} />

          {/* Cầu vai áo */}
          <path
            d="M 24 98 C 24 85, 38 80, 50 80 C 62 80, 76 85, 76 98 Z"
            fill={outfitColor}
          />
          <path
            d="M 32 98 C 34 88, 42 85, 50 85 C 58 85, 66 88, 68 98 Z"
            fill={outfitShadow}
          />

          {/* Cổ áo sơ mi / áo thun */}
          <path
            d="M 43 80 L 50 90 L 57 80 L 53 79 L 50 84 L 47 79 Z"
            fill="#ffffff"
          />

          {/* Cà vạt (cho cán bộ/trí thức base 2) */}
          {baseSkin === 2 && (
            <path d="M 48 88 L 52 88 L 53 98 L 47 98 Z" fill="#e11d48" />
          )}

          {/* Huy hiệu Đoàn / Ngôi sao đỏ KTCT trên ngực */}
          {(accessory === 'badge' || baseSkin === 0) && (
            <g transform="translate(60, 88) scale(0.65)">
              <circle cx="5" cy="5" r="5" fill="#dc2626" />
              <polygon
                points="5,1.5 6.2,4 8.8,4.2 6.8,6 7.4,8.5 5,7.2 2.6,8.5 3.2,6 1.2,4.2 3.8,4"
                fill="#fbbf24"
              />
            </g>
          )}
        </g>

        {/* 3. TAI TRÁI & TAI PHẢI */}
        <g fill={skinTone} stroke={skinShadow} strokeWidth="0.6">
          <ellipse cx="33" cy="49" rx="3.5" ry="5.5" />
          <ellipse cx="67" cy="49" rx="3.5" ry="5.5" />
          <ellipse cx="33.5" cy="49" rx="1.8" ry="3" fill={skinShadow} stroke="none" />
          <ellipse cx="66.5" cy="49" rx="1.8" ry="3" fill={skinShadow} stroke="none" />
        </g>

        {/* 4. KHUÔN MẶT */}
        <path d={facePath} fill={`url(#skinGlow-${skinTone})`} />

        {/* Má hồng (nếu có accessory blush hoặc tạo sắc tố hồng) */}
        {(accessory === 'blush' || appearance.gender === 'female') && (
          <g fill="#f43f5e" opacity="0.32">
            <ellipse cx="39" cy="55" rx="3.5" ry="2" />
            <ellipse cx="61" cy="55" rx="3.5" ry="2" />
          </g>
        )}

        {/* 5. LÔNG MÀY */}
        <g stroke={hairShadow} strokeWidth="1.6" strokeLinecap="round">
          {eyeStyle === 'determined' ? (
            <>
              <line x1="40" y1="42" x2="47" y2="44" />
              <line x1="60" y1="42" x2="53" y2="44" />
            </>
          ) : eyeStyle === 'sharp' ? (
            <>
              <line x1="39" y1="43" x2="47" y2="42" />
              <line x1="61" y1="43" x2="53" y2="42" />
            </>
          ) : (
            <>
              <path d="M 40 43 Q 44 41 48 43" fill="none" />
              <path d="M 60 43 Q 56 41 52 43" fill="none" />
            </>
          )}
        </g>

        {/* 6. ĐÔI MẮT */}
        <g>
          {eyeStyle === 'sunglasses' ? (
            // Kính râm cool ngầu
            <g>
              <rect x="36" y="44" width="13" height="9" rx="2.5" fill="url(#shadesGrad)" />
              <rect x="51" y="44" width="13" height="9" rx="2.5" fill="url(#shadesGrad)" />
              <line x1="49" y1="46" x2="51" y2="46" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="33" y1="47" x2="36" y2="47" stroke="#94a3b8" strokeWidth="1" />
              <line x1="64" y1="47" x2="67" y2="47" stroke="#94a3b8" strokeWidth="1" />
              {/* Vệt sáng chéo trên kính */}
              <line x1="38" y1="45" x2="45" y2="52" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
              <line x1="53" y1="45" x2="60" y2="52" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
            </g>
          ) : eyeStyle === 'happy' ? (
            // Mắt cười híp rạng rỡ (^ ^)
            <g stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M 40 49 Q 44 45 48 49" />
              <path d="M 52 49 Q 56 45 60 49" />
            </g>
          ) : (
            // Mắt thường / tinh anh / kiên định / kính cận
            <g>
              {/* Lòng trắng */}
              <ellipse cx="43.5" cy="48" rx="4.5" ry="3.8" fill="#ffffff" stroke="#334155" strokeWidth="0.6" />
              <ellipse cx="56.5" cy="48" rx="4.5" ry="3.8" fill="#ffffff" stroke="#334155" strokeWidth="0.6" />

              {/* Tròng mắt màu (Iris) */}
              <ellipse cx="43.5" cy="48" rx="2.8" ry="3.2" fill={eyeColor} />
              <ellipse cx="56.5" cy="48" rx="2.8" ry="3.2" fill={eyeColor} />

              {/* Con ngươi đen (Pupil) */}
              <circle cx="43.5" cy="48" r="1.6" fill="#090d16" />
              <circle cx="56.5" cy="48" r="1.6" fill="#090d16" />

              {/* Đốm sáng phản chiếu mắt (Eye sparkle) */}
              <circle cx="42.4" cy="46.8" r="1.1" fill="#ffffff" />
              <circle cx="55.4" cy="46.8" r="1.1" fill="#ffffff" />
              <circle cx="44.8" cy="49.2" r="0.6" fill="#ffffff" opacity="0.85" />
              <circle cx="57.8" cy="49.2" r="0.6" fill="#ffffff" opacity="0.85" />

              {/* Mí mắt trên */}
              <path d="M 39 46 Q 43.5 44 48 46" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M 52 46 Q 56.5 44 61 46" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

              {/* Kính cận tri thức */}
              {eyeStyle === 'glasses' && (
                <g stroke="#38bdf8" strokeWidth="1.1" fill="none">
                  <circle cx="43.5" cy="48" r="5.5" />
                  <circle cx="56.5" cy="48" r="5.5" />
                  <line x1="49" y1="48" x2="51" y2="48" stroke="#38bdf8" strokeWidth="1.2" />
                  <line x1="33" y1="48" x2="38" y2="48" stroke="#38bdf8" strokeWidth="0.8" />
                  <line x1="62" y1="48" x2="67" y2="48" stroke="#38bdf8" strokeWidth="0.8" />
                  {/* Phản xạ kính */}
                  <line x1="41" y1="45" x2="45" y2="47" stroke="#ffffff" strokeWidth="0.7" opacity="0.6" />
                  <line x1="54" y1="45" x2="58" y2="47" stroke="#ffffff" strokeWidth="0.7" opacity="0.6" />
                </g>
              )}
            </g>
          )}
        </g>

        {/* 7. MŨI */}
        <path d="M 50 51 L 49.2 54 L 50.8 54" stroke={skinShadow} strokeWidth="0.8" fill="none" strokeLinecap="round" />

        {/* 8. MIỆNG & BIỂU CẢM */}
        <g>
          {mouthStyle === 'mask' ? (
            // Khẩu trang y tế văn minh
            <g>
              <rect x="40" y="55" width="20" height="15" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              <line x1="41" y1="60" x2="59" y2="60" stroke="#e2e8f0" strokeWidth="0.6" />
              <line x1="41" y1="65" x2="59" y2="65" stroke="#e2e8f0" strokeWidth="0.6" />
              {/* Dây đeo tai */}
              <line x1="40" y1="58" x2="35" y2="52" stroke="#cbd5e1" strokeWidth="0.8" />
              <line x1="60" y1="58" x2="65" y2="52" stroke="#cbd5e1" strokeWidth="0.8" />
            </g>
          ) : mouthStyle === 'grin' ? (
            // Cười tươi rạng rỡ (hở răng)
            <g>
              <path d="M 44 59 Q 50 67 56 59 Z" fill="#b91c1c" />
              <path d="M 45 59.5 Q 50 63 55 59.5 Z" fill="#ffffff" />
              <path d="M 43 59 Q 50 67 57 59" stroke="#991b1b" strokeWidth="0.8" fill="none" />
            </g>
          ) : mouthStyle === 'confident' ? (
            // Cười nhếch mép tự tin
            <path d="M 45 61 Q 51 63 56 59" stroke="#991b1b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          ) : mouthStyle === 'serious' ? (
            // Nghiêm túc, kiên định
            <line x1="46" y1="61" x2="54" y2="61" stroke="#991b1b" strokeWidth="1.3" strokeLinecap="round" />
          ) : mouthStyle === 'straw' ? (
            // Ngậm cọng cỏ phong lưu
            <g>
              <path d="M 45 60 Q 50 62 55 60" stroke="#991b1b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              <path d="M 48 61 Q 38 67 34 68" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <circle cx="34" cy="68" r="1.5" fill="#22c55e" />
            </g>
          ) : (
            // Cười mỉm thân thiện (smile)
            <path d="M 45 60 Q 50 64 55 60" stroke="#991b1b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* 9. KIỂU TÓC PHÍA TRƯỚC (Front Hair) */}
        <g fill={`url(#hairShine-${hairColor.replace('#', '')})`}>
          {hairStyle === 'short_neat' && (
            // Tóc vuốt nam sinh chuẩn mực
            <path d="M 33 44 C 32 30, 42 22, 50 22 C 60 22, 68 28, 67 44 C 64 36, 56 34, 50 36 C 44 38, 38 36, 33 44 Z" />
          )}

          {hairStyle === 'undercut' && (
            // Undercut cá tính, đỉnh phồng cao
            <g>
              <path d="M 34 42 C 34 26, 44 18, 54 18 C 64 18, 68 25, 66 38 C 62 30, 54 28, 48 29 C 42 30, 36 34, 34 42 Z" />
              <path d="M 32 40 L 35 44 L 35 36 Z" fill={hairShadow} />
              <path d="M 68 40 L 65 44 L 65 36 Z" fill={hairShadow} />
            </g>
          )}

          {hairStyle === 'spiky' && (
            // Tóc vuốt nhọn năng động
            <path d="M 33 44 L 36 32 L 40 36 L 46 22 L 50 30 L 56 20 L 58 32 L 64 30 L 67 44 C 62 38, 55 36, 50 38 C 45 36, 38 38, 33 44 Z" />
          )}

          {hairStyle === 'bob' && (
            // Tóc Bob nữ sinh hiện đại
            <path d="M 31 46 C 30 28, 40 22, 50 22 C 60 22, 70 28, 69 46 C 68 56, 66 62, 64 64 C 64 50, 60 38, 50 38 C 40 38, 36 50, 36 64 C 34 62, 32 56, 31 46 Z" />
          )}

          {hairStyle === 'long_wavy' && (
            // Mái tóc dài lượn sóng
            <path d="M 32 45 C 31 28, 42 22, 50 22 C 60 22, 69 28, 68 45 C 64 36, 58 36, 50 38 C 42 36, 36 36, 32 45 Z" />
          )}

          {hairStyle === 'ponytail' && (
            // Tóc búi / đuôi ngựa có mái chéo
            <g>
              <path d="M 33 44 C 32 28, 42 22, 50 22 C 60 22, 68 28, 67 44 C 63 36, 56 35, 50 38 C 44 35, 37 36, 33 44 Z" />
              {/* Nơ buộc tóc */}
              <circle cx="68" cy="38" r="3.2" fill="#ec4899" />
            </g>
          )}

          {hairStyle === 'curly' && (
            // Tóc uốn xoăn bồng bềnh
            <path d="M 30 46 C 30 38, 32 30, 38 26 C 42 22, 48 21, 52 21 C 58 21, 64 24, 68 28 C 72 34, 71 42, 69 46 C 65 38, 58 36, 50 38 C 42 36, 35 38, 30 46 Z" />
          )}

          {hairStyle === 'parted' && (
            // Tóc rẽ ngôi 7/3 thư sinh
            <path d="M 32 44 C 32 28, 42 22, 50 22 C 60 22, 68 26, 67 44 C 63 35, 55 33, 44 34 C 38 35, 34 38, 32 44 Z" />
          )}
        </g>

        {/* 10. PHỤ KIỆN ĐẦU (Headband / Headphones) */}
        {accessory === 'headband' && (
          // Băng đô đỏ quyết tâm
          <g>
            <path d="M 32 37 Q 50 34 68 37 L 68 41 Q 50 38 32 41 Z" fill="#dc2626" />
            <polygon
              points="50,36.5 51.5,39 54,39.2 52,41 52.6,43.5 50,42.2 47.4,43.5 48,41 46,39.2 48.5,39"
              fill="#fbbf24"
            />
          </g>
        )}

        {accessory === 'headphones' && (
          // Tai nghe Gaming / DJ trên cổ
          <g stroke="#0f172a" strokeWidth="1">
            {/* Đệm tai nghe 2 bên */}
            <rect x="27" y="66" width="7" height="11" rx="3.5" fill="#06b6d4" />
            <rect x="66" y="66" width="7" height="11" rx="3.5" fill="#06b6d4" />
            {/* Vòng đai cổ */}
            <path d="M 33 72 C 38 78, 62 78, 67 72" fill="none" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
