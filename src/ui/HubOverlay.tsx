import React, { useEffect, useRef, useState } from 'react';
import { EventBus } from '../game/EventBus';
import { useProgress } from '../systems/save';
import { getTotalStars } from '../systems/progress';
import { HUB_ZONES, HubZone, WORLD_H, WORLD_W } from '../data/hub-zones';

export const TOTAL_QUIZ_STARS = 60; // 20 màn x 3 sao
const TOTAL_CARDS = 33;
const TOTAL_TERMS = 83;
const TOTAL_SCENARIOS = 12;
const TOTAL_BADGES = 3;

const go = (zone: HubZone) => {
  EventBus.emit('request-transition', {
    target: zone.target,
    label: zone.transitionLabel,
    variant: zone.variant,
  });
};

interface ZoneStat {
  zone: HubZone;
  done: number;
  total: number;
  unit: string;
}

interface HubMoveEvent {
  x: number;
  y: number;
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
}

export const HubOverlay: React.FC = () => {
  const [progress] = useProgress();
  const [nearLabel, setNearLabel] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (p: HubMoveEvent) => {
      const dot = dotRef.current;
      if (dot) {
        dot.style.left = `${p.x * 100}%`;
        dot.style.top = `${p.y * 100}%`;
      }
      const view = viewRef.current;
      if (view) {
        view.style.left = `${p.viewX * 100}%`;
        view.style.top = `${p.viewY * 100}%`;
        view.style.width = `${p.viewW * 100}%`;
        view.style.height = `${p.viewH * 100}%`;
      }
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
  const scenarios = Object.keys(progress.scenarioRecords).length;
  const badges = progress.badges.length;

  const stats: ZoneStat[] = [
    { zone: HUB_ZONES[0], done: cards, total: TOTAL_CARDS, unit: 'bài học' },
    { zone: HUB_ZONES[1], done: scenarios, total: TOTAL_SCENARIOS, unit: 'tình huống' },
    { zone: HUB_ZONES[2], done: totalStars, total: TOTAL_QUIZ_STARS, unit: 'sao' },
    { zone: HUB_ZONES[3], done: terms, total: TOTAL_TERMS, unit: 'thuật ngữ' },
  ];

  const overall = Math.round(
    ((cards / TOTAL_CARDS +
      scenarios / TOTAL_SCENARIOS +
      totalStars / TOTAL_QUIZ_STARS +
      terms / TOTAL_TERMS) /
      4) *
      100
  );

  // --- Gợi ý mục tiêu kế tiếp ---
  let quest: { zone: HubZone; text: string };
  if (cards < 5) {
    quest = { zone: HUB_ZONES[0], text: `Đọc 5 thẻ bài học đầu tiên (${cards}/5)` };
  } else if (totalStars < 6) {
    quest = { zone: HUB_ZONES[2], text: `Giành 6 sao ở Tòa Thử Thách (${totalStars}/6)` };
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

      {/* ---------- BẢNG ĐIỀU HƯỚNG (góc trên phải) ---------- */}
      <aside className="absolute top-3 right-3 w-[246px] overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/85 shadow-2xl backdrop-blur-md pointer-events-auto">
        {/* Thanh tiêu đề */}
        <header className="flex items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.9)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-300">
              Khu Trung Tâm
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5">
            <span className="text-[9px]">🎖️</span>
            <span className="text-[9px] font-black tabular-nums text-amber-300">
              {badges}/{TOTAL_BADGES}
            </span>
          </div>
        </header>

        {/* Minimap */}
        <div className="px-3 pt-3">
          <div
            className="relative overflow-hidden rounded-lg ring-1 ring-slate-700/80"
            style={{ aspectRatio: `${WORLD_W} / ${WORLD_H}` }}
          >
            <img
              src="assets/maps/city-base.png"
              alt="Bản đồ thu nhỏ khu trung tâm"
              className="absolute inset-0 h-full w-full object-cover saturate-[0.85]"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* phủ tối nhẹ để các điểm mốc nổi lên */}
            <div className="absolute inset-0 bg-slate-950/35" />

            {/* khung thể hiện vùng camera đang nhìn */}
            <div
              ref={viewRef}
              className="absolute rounded-[3px] border border-white/80 bg-white/10"
              style={{ left: '20%', top: '0%', width: '42%', height: '100%' }}
            />

            {HUB_ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => go(z)}
                title={`${z.name} — ${z.tagline}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${(z.x / WORLD_W) * 100}%`,
                  top: `${(z.y / WORLD_H) * 100}%`,
                }}
              >
                <span
                  className="block h-2.5 w-2.5 rounded-full border border-slate-950/90 transition-transform group-hover:scale-150"
                  style={{ backgroundColor: z.hex, boxShadow: `0 0 6px 1px ${z.hex}99` }}
                />
              </button>
            ))}

            {/* vị trí người chơi */}
            <div
              ref={dotRef}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: '52%', top: '74%' }}
            >
              <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/50" />
              <span className="relative block h-2 w-2 rounded-full bg-white ring-2 ring-slate-950/90" />
            </div>
          </div>
        </div>

        {/* 4 ô tiến độ */}
        <div className="grid grid-cols-2 gap-1.5 p-3 pt-2.5">
          {stats.map(({ zone, done, total, unit }) => {
            const pct = Math.min(100, (done / total) * 100);
            return (
              <button
                key={zone.id}
                onClick={() => go(zone)}
                title={zone.tagline}
                className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-left transition-colors hover:border-slate-600 hover:bg-slate-800/70 cursor-pointer"
              >
                <span
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ backgroundColor: zone.hex }}
                />
                <span className="flex items-center gap-1.5 pl-1">
                  <span className="text-[11px] leading-none">{zone.icon}</span>
                  <span className="truncate text-[10px] font-black text-slate-200">
                    {zone.shortName}
                  </span>
                </span>
                <span className="mt-1 block pl-1 text-[9px] font-bold tabular-nums text-slate-400">
                  <span className="text-[12px] font-black text-slate-100">{done}</span>
                  <span className="text-slate-500">/{total}</span>{' '}
                  <span className="text-slate-500">{unit}</span>
                </span>
                <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${pct}%`, backgroundColor: zone.hex }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Tổng tiến độ */}
        <footer className="flex items-center gap-2 border-t border-slate-800/80 bg-slate-900/50 px-3 py-2">
          <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            Tổng tiến độ
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-[width] duration-500"
              style={{ width: `${overall}%` }}
            />
          </span>
          <span className="text-[10px] font-black tabular-nums text-emerald-300">{overall}%</span>
        </footer>
      </aside>

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
