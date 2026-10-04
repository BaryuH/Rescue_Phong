import React, { useState, useMemo } from 'react';
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

// Regex tìm kiếm các thuật ngữ
const termPattern = new RegExp(
  `(${sortedTerms.map((t) => t.term.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')).join('|')})`,
  'gi'
);

/**
 * Chuẩn hóa chuỗi tiếng Việt bỏ dấu và chuyển chữ thường để tìm kiếm không dấu
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Chuyển đổi mã nguồn (source) thành định dạng số mục chuẩn, không kèm tựa đề
 * Ví dụ: "II.1.a.the-che" -> "II - 1 - A", "III.1.b.mot-so-quan-he-loi-ich" -> "III - 1 - B"
 */
export function formatSectionNumber(source: string): string {
  if (!source) return '';
  const parts = source.split('.');
  const roman = parts[0]?.toUpperCase() || '';
  const num = parts[1];
  const letter = parts[2] && parts[2].length === 1 ? parts[2].toUpperCase() : null;

  if (roman && num && letter) {
    return `${roman} - ${num} - ${letter}`;
  }
  if (roman && num) {
    return `${roman} - ${num}`;
  }
  return roman;
}

// Regex phân giải định dạng inline markdown: bold-italic, bold, italic
const inlineMarkdownRegex = /(\*\*\*[^*]+?\*\*\*|___[^_]+?___|\*\*[^*]+?\*\*|__[^_]+?__|\*[^*]+?\*|_([^_]+?)_)/g;

interface FormattedToken {
  type: 'plain' | 'bold' | 'italic' | 'bold-italic';
  text: string;
}

function parseMarkdownTokens(rawText: string): FormattedToken[] {
  const tokens: FormattedToken[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  inlineMarkdownRegex.lastIndex = 0;

  while ((match = inlineMarkdownRegex.exec(rawText)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ type: 'plain', text: rawText.slice(lastIdx, match.index) });
    }
    const tokenStr = match[0];
    if (
      (tokenStr.startsWith('***') && tokenStr.endsWith('***')) ||
      (tokenStr.startsWith('___') && tokenStr.endsWith('___'))
    ) {
      tokens.push({ type: 'bold-italic', text: tokenStr.slice(3, -3) });
    } else if (
      (tokenStr.startsWith('**') && tokenStr.endsWith('**')) ||
      (tokenStr.startsWith('__') && tokenStr.endsWith('__'))
    ) {
      tokens.push({ type: 'bold', text: tokenStr.slice(2, -2) });
    } else if (
      (tokenStr.startsWith('*') && tokenStr.endsWith('*')) ||
      (tokenStr.startsWith('_') && tokenStr.endsWith('_'))
    ) {
      tokens.push({ type: 'italic', text: tokenStr.slice(1, -1) });
    }
    lastIdx = inlineMarkdownRegex.lastIndex;
  }

  if (lastIdx < rawText.length) {
    tokens.push({ type: 'plain', text: rawText.slice(lastIdx) });
  }

  return tokens;
}

interface Props {
  text: string;
}

export const HighlightedText: React.FC<Props> = ({ text }) => {
  const [progress, saveProgress] = useProgress();
  const [hoveredTerm, setHoveredTerm] = useState<TermItem | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  const tokens = useMemo(() => parseMarkdownTokens(text), [text]);

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

  const renderSegmentWithTerms = (chunkText: string, prefix: string) => {
    const parts = chunkText.split(termPattern);

    return parts.map((part, pIdx) => {
      const matched = sortedTerms.find(
        (t) => t.term.toLowerCase() === part.toLowerCase()
      );

      if (matched) {
        return (
          <span
            key={`${prefix}-m-${pIdx}`}
            onMouseEnter={(e) => handleMouseEnter(part, e)}
            onMouseLeave={handleMouseLeave}
            className="text-emerald-700 font-bold underline decoration-dotted decoration-emerald-600/80 cursor-help hover:text-emerald-900 transition-colors"
          >
            {part}
          </span>
        );
      }

      return <React.Fragment key={`${prefix}-p-${pIdx}`}>{part}</React.Fragment>;
    });
  };

  return (
    <span className="relative">
      {tokens.map((token, tIdx) => {
        const renderedText = renderSegmentWithTerms(token.text, `tok-${tIdx}`);

        if (token.type === 'bold-italic') {
          return (
            <strong key={tIdx} className="font-black italic text-slate-950">
              {renderedText}
            </strong>
          );
        }

        if (token.type === 'bold') {
          return (
            <strong key={tIdx} className="font-black text-slate-950">
              {renderedText}
            </strong>
          );
        }

        if (token.type === 'italic') {
          return (
            <em key={tIdx} className="italic text-slate-900 font-semibold">
              {renderedText}
            </em>
          );
        }

        return <React.Fragment key={tIdx}>{renderedText}</React.Fragment>;
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
              {formatSectionNumber(hoveredTerm.source)}
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
