import React, { useEffect, useState } from 'react';
import { EventBus } from '../game/EventBus';
import { useProgress } from '../systems/save';
import { getTotalStars } from '../systems/progress';
import { HUB_ZONES, HubZone } from '../data/hub-zones';

export const TOTAL_QUIZ_STARS = 60; // 20 màn x 3 sao
export const TOTAL_BADGES = 10; // 10 tình huống đối đầu với 10 NPC

const go = (zone: HubZone) => {
  EventBus.emit('request-transition', {
    target: zone.target,
    label: zone.transitionLabel,
    variant: zone.variant,
  });
};

export const HubOverlay: React.FC = () => {
  const [progress] = useProgress();
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

  const totalStars = getTotalStars(progress.quizStars);
  const cards = progress.learnedCards.length;
  const terms = progress.collectedTerms.length;
  const badges = progress.badges.length;

  // --- Gợi ý mục tiêu kế tiếp ---
  let quest: { zone: HubZone; text: string };
  if (cards < 5) {
    quest = { zone: HUB_ZONES[0], text: `Đọc 5 thẻ bài học đầu tiên (${cards}/5)` };
  } else if (totalStars < 6) {
    quest = { zone: HUB_ZONES[2], text: `Giành 6 sao ở Thử Thách (${totalStars}/6)` };
  } else if (badges < TOTAL_BADGES) {
    quest = {
      zone: HUB_ZONES[1],
      text: `Thắng tình huống lấy Huy hiệu Thể chế (${badges}/${TOTAL_BADGES})`,
    };
  } else if (terms < 20) {
    quest = { zone: HUB_ZONES[3], text: `Sưu tầm 20 thuật ngữ Pokédex (${terms}/20)` };
  } else {
    quest = { zone: HUB_ZONES[1], text: 'Đủ điều kiện giải cứu Phong — vào Đấu Trường!' };
  }

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

      {/* ---------- MỤC TIÊU KẾ TIẾP (góc trên trái) ---------- */}
      <div className="absolute top-3 left-3 pointer-events-auto">
        <button
          onClick={() => go(quest.zone)}
          className="group flex items-center gap-2.5 rounded-xl border border-slate-700/70 bg-slate-950/80 backdrop-blur-md px-3 py-2 text-left shadow-xl transition-colors hover:border-amber-400/70 cursor-pointer"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
            style={{ backgroundColor: `${quest.zone.hex}26`, border: `1px solid ${quest.zone.hex}` }}
          >
            {quest.zone.icon}
          </span>
          <span className="leading-tight">
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-amber-400">
              Mục tiêu kế tiếp
            </span>
            <span className="block max-w-[210px] text-[11px] font-bold text-slate-100">
              {quest.text}
            </span>
          </span>
          <span className="ml-1 text-slate-500 transition-transform group-hover:translate-x-0.5">
            ›
          </span>
        </button>

        {nearLabel && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/60 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Đang đứng trước: {nearLabel}
          </div>
        )}
      </div>



      {/* ---------- GỢI Ý ĐIỀU KHIỂN (tự ẩn khi bắt đầu đi) ---------- */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
          hintVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/85 px-3.5 py-1.5 text-[10px] font-bold text-slate-300 backdrop-blur-md shadow-xl">
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
            W A S D
          </kbd>
          di chuyển
          <span className="text-slate-600">•</span>
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
            SPACE
          </kbd>
          bước vào cửa
        </div>
      </div>
    </div>
  );
};
