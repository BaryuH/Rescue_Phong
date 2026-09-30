import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Search, Sparkles, Filter } from 'lucide-react';
import cardsData from '../../data/knowledge/cards.json';
import { useProgress } from '../../systems/save';
import { HighlightedText } from './TermTooltip';

interface Props {
  initialCardId?: string | null;
  onSelectTermLink?: (termId: string) => void;
}

export const LessonReader: React.FC<Props> = ({ initialCardId }) => {
  const [progress, saveProgress] = useProgress();
  const [search, setSearch] = useState('');
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlearned' | 'learned'>('all');

  // Mở thẻ từ sơ đồ tư duy: cuộn đúng thẻ được trỏ tới vào giữa khung
  useEffect(() => {
    if (!initialCardId) return;
    const target = cardsData.find((c) => c.id === initialCardId || c.source === initialCardId);
    if (!target) return;
    const el = document.getElementById(target.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [initialCardId]);

  const totalCards = cardsData.length;
  const learnedCount = progress.learnedCards.length;
  const ch1Total = cardsData.filter((c) => c.chapter === 1).length;
  const ch1Learned = cardsData.filter((c) => c.chapter === 1 && progress.learnedCards.includes(c.id)).length;
  const ch2Total = cardsData.filter((c) => c.chapter === 2).length;
  const ch2Learned = cardsData.filter((c) => c.chapter === 2 && progress.learnedCards.includes(c.id)).length;

  const toggleLearned = (cardId: string) => {
    const isLearned = progress.learnedCards.includes(cardId);
    const updated = isLearned
      ? progress.learnedCards.filter((id) => id !== cardId)
      : [...progress.learnedCards, cardId];
    saveProgress({ learnedCards: updated });
  };

  const filteredCards = cardsData.filter((card) => {
    const matchCh = chapterFilter === 'all' || card.chapter === chapterFilter;
    const isLearned = progress.learnedCards.includes(card.id);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'learned' && isLearned) ||
      (statusFilter === 'unlearned' && !isLearned);
    const matchQ =
      !search ||
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.content.toLowerCase().includes(search.toLowerCase()) ||
      card.source.toLowerCase().includes(search.toLowerCase());
    return matchCh && matchStatus && matchQ;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 text-slate-100">
      {/* Header Tiến độ học tập theo chương */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          {/* Tổng tiến độ */}
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Tiến Độ Toàn Khóa
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round((learnedCount / totalCards) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs font-black text-emerald-400">
                {learnedCount}/{totalCards} ({Math.round((learnedCount / totalCards) * 100)}%)
              </span>
            </div>
          </div>

          {/* Tiến độ Chương 1 */}
          <div className="hidden sm:block border-l border-slate-800 pl-6">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">Chương 1 (Thể Chế)</div>
            <div className="font-mono text-xs text-amber-400 font-bold">
              {ch1Learned}/{ch1Total} Thẻ
            </div>
          </div>

          {/* Tiến độ Chương 2 */}
          <div className="hidden sm:block border-l border-slate-800 pl-6">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">Chương 2 (Lợi Ích)</div>
            <div className="font-mono text-xs text-purple-400 font-bold">
              {ch2Learned}/{ch2Total} Thẻ
            </div>
          </div>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('unlearned')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'unlearned'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Chưa học ({totalCards - learnedCount})
            </button>
            <button
              onClick={() => setStatusFilter('learned')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'learned'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Đã học ({learnedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm & lọc chương */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm bài học, khái niệm, source ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setChapterFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
              chapterFilter === 'all'
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setChapterFilter(1)}
            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
              chapterFilter === 1
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Chương 1: Thể Chế
          </button>
          <button
            onClick={() => setChapterFilter(2)}
            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
              chapterFilter === 2
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Chương 2: Lợi Ích
          </button>
        </div>
      </div>

      {/* Danh sách thẻ bài học */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredCards.map((card) => {
            const isLearned = progress.learnedCards.includes(card.id);
            const isHighlighted = initialCardId === card.id || initialCardId === card.source;

            return (
              <div
                key={card.id}
                id={card.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 shadow-md ${
                  isHighlighted
                    ? 'ring-2 ring-amber-400 border-amber-500 bg-slate-900'
                    : isLearned
                    ? 'bg-slate-950/70 border-emerald-800/60'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {card.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {card.wordCount} chữ
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-sm text-slate-100 mb-3 tracking-wide">
                    {card.title}
                  </h3>

                  {/* Summary Callout */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 italic mb-3">
                    💡 {card.summary}
                  </div>

                  {/* Content with Auto-Highlight Term Tooltip */}
                  <div className="text-xs text-slate-300/90 leading-relaxed whitespace-pre-line">
                    <HighlightedText text={card.content.replace(/^###.+?\n/, '').trim()} />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold">
                    Chương {card.chapter}
                  </span>

                  <button
                    onClick={() => toggleLearned(card.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isLearned
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 hover:bg-emerald-900'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {isLearned ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã học</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Đánh dấu đã học</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
