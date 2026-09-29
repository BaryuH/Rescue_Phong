import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import termsData from '../../data/terms.json';
import { useProgress } from '../../systems/save';

interface TermItem {
  id: string;
  term: string;
  definition: string;
  source: string;
  chapter: number;
}

// Sắp xếp thuật ngữ theo độ dài giảm dần để match từ dài nhất trước
const sortedTerms = [...(termsData as TermItem[])].sort(
  (a, b) => b.term.length - a.term.length
);

interface Props {
  text: string;
}

export const HighlightedText: React.FC<Props> = ({ text }) => {
  const [progress, saveProgress] = useProgress();
  const [hoveredTerm, setHoveredTerm] = useState<TermItem | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  // Tạo regex tìm kiếm các thuật ngữ
  // Escape các ký tự đặc biệt trong regex
  const pattern = new RegExp(
    `(${sortedTerms.map((t) => t.term.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')).join('|')})`,
    'gi'
  );

  const parts = text.split(pattern);

  const handleMouseEnter = (termName: string, e: React.MouseEvent) => {
    const found = sortedTerms.find(
      (t) => t.term.toLowerCase() === termName.toLowerCase()
    );
    if (found) {
      setHoveredTerm(found);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopoverPos({ x: rect.left, y: rect.bottom + 6 });

      // Tự động ghi vào sổ Pokédex nếu chưa có
      if (!progress.collectedTerms.includes(found.id)) {
        saveProgress({
          collectedTerms: [...progress.collectedTerms, found.id],
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredTerm(null);
    setPopoverPos(null);
  };

  return (
    <span className="relative">
      {parts.map((part, idx) => {
        const matched = sortedTerms.find(
          (t) => t.term.toLowerCase() === part.toLowerCase()
        );

        if (matched) {
          return (
            <span
              key={idx}
              onMouseEnter={(e) => handleMouseEnter(part, e)}
              onMouseLeave={handleMouseLeave}
              className="text-emerald-400 font-semibold underline decoration-dotted decoration-emerald-500/80 cursor-help hover:text-emerald-300 transition-colors"
            >
              {part}
            </span>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}

      {/* Floating Popover Tooltip */}
      {hoveredTerm && popoverPos && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(window.innerWidth - 320, Math.max(10, popoverPos.x)),
            top: Math.min(window.innerHeight - 180, popoverPos.y),
            zIndex: 60,
          }}
          className="w-72 bg-slate-900 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-black text-xs text-amber-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              {hoveredTerm.term}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {hoveredTerm.source}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
            {hoveredTerm.definition}
          </p>
          <div className="mt-2 text-[9px] text-emerald-400 font-bold flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span>Chương {hoveredTerm.chapter}</span>
            <span>✓ Đã ghi vào sổ Pokédex</span>
          </div>
        </div>
      )}
    </span>
  );
};
