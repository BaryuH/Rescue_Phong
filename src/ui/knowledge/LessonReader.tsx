import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Search, Sparkles, Filter, BookOpen } from 'lucide-react';
import cardsData from '../../data/knowledge/cards.json';
import { useProgress } from '../../systems/save';
import { HighlightedText, formatSectionNumber } from './TermTooltip';

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
  const percentComplete = Math.round((learnedCount / totalCards) * 100);

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
      card.source.toLowerCase().includes(search.toLowerCase()) ||
      formatSectionNumber(card.source).toLowerCase().includes(search.toLowerCase());
    return matchCh && matchStatus && matchQ;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-dot-pattern text-slate-900 font-sans select-none">
      {/* Header Tiến độ học tập phong cách The Growth G3 Indigo Banner */}
      <div className="p-3 sm:p-4 bg-white/90 border-b-2.5 border-slate-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-comic-sm">
        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
          {/* Indigo Header Info */}
          <div className="flex items-center gap-2.5 bg-indigo-200 border-2 border-slate-900 rounded-xl px-3.5 py-2 shadow-comic-sm">
            <BookOpen className="w-5 h-5 text-indigo-900 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-comic font-black text-indigo-950 uppercase tracking-wide">
                TIẾN ĐỘ THƯ VIỆN BÀI HỌC
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-32 sm:w-40 h-3 bg-white border border-slate-900 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
                <span className="font-comic font-black text-xs text-indigo-950">
                  {learnedCount}/{totalCards} ({percentComplete}%)
                </span>
              </div>
            </div>
          </div>

          {/* Tiến độ Mục II Mini Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-amber-100 border-2 border-slate-900 rounded-xl px-3 py-1.5 shadow-comic-sm">
            <div className="text-[10px] font-comic font-black text-amber-950">
              [ MỤC II: THỂ CHẾ ]
            </div>
            <span className="font-comic font-black text-xs text-amber-900">
              {ch1Learned}/{ch1Total} Thẻ
            </span>
          </div>

          {/* Tiến độ Mục III Mini Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-purple-100 border-2 border-slate-900 rounded-xl px-3 py-1.5 shadow-comic-sm">
            <div className="text-[10px] font-comic font-black text-purple-950">
              [ MỤC III: LỢI ÍCH ]
            </div>
            <span className="font-comic font-black text-xs text-purple-900">
              {ch2Learned}/{ch2Total} Thẻ
            </span>
          </div>
        </div>

        {/* Bộ lọc trạng thái style The Growth G3 */}
        <div className="flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border-2 border-slate-900 shadow-comic-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-comic font-black transition-all cursor-pointer rounded-lg border-2 btn-comic-press ${
              statusFilter === 'all'
                ? 'bg-indigo-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-transparent font-bold'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setStatusFilter('unlearned')}
            className={`px-3 py-1 text-xs font-comic font-black transition-all cursor-pointer rounded-lg border-2 btn-comic-press ${
              statusFilter === 'unlearned'
                ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-transparent font-bold'
            }`}
          >
            Chưa Học ({totalCards - learnedCount})
          </button>
          <button
            onClick={() => setStatusFilter('learned')}
            className={`px-3 py-1 text-xs font-comic font-black transition-all cursor-pointer rounded-lg border-2 btn-comic-press ${
              statusFilter === 'learned'
                ? 'bg-emerald-300 text-emerald-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-transparent font-bold'
            }`}
          >
            Đã Học ({learnedCount})
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm & lọc chương phong cách Comic */}
      <div className="p-3 bg-white/70 border-b-2 border-slate-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-indigo-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm bài học, khái niệm, source ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 placeholder-slate-500 shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] font-comic font-black uppercase text-slate-600 hidden sm:inline">MỤC:</span>
          <button
            onClick={() => setChapterFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
              chapterFilter === 'all'
                ? 'bg-indigo-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-900 font-bold'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setChapterFilter(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
              chapterFilter === 1
                ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-900 font-bold'
            }`}
          >
            Mục II: Thể Chế
          </button>
          <button
            onClick={() => setChapterFilter(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
              chapterFilter === 2
                ? 'bg-purple-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-900 font-bold'
            }`}
          >
            Mục III: Lợi Ích
          </button>
        </div>
      </div>

      {/* Danh sách thẻ bài học - The Growth G3 Comic Cards */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredCards.map((card) => {
            const isLearned = progress.learnedCards.includes(card.id);
            const isHighlighted = initialCardId === card.id || initialCardId === card.source;

            return (
              <div
                key={card.id}
                id={card.id}
                className={`p-5 rounded-2xl border-2.5 transition-all flex flex-col justify-between select-none ${
                  isHighlighted
                    ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-400 shadow-comic-lg'
                    : isLearned
                    ? 'bg-indigo-50/70 border-indigo-900 shadow-comic-indigo'
                    : 'bg-white border-slate-900 shadow-comic hover:shadow-comic-lg'
                }`}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-900/15">
                    <span className="text-[10px] font-comic font-black uppercase bg-indigo-200 text-indigo-950 border border-slate-900 px-2.5 py-0.5 rounded-lg shadow-comic-sm whitespace-nowrap inline-block">
                      {formatSectionNumber(card.source)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {card.wordCount} chữ
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-comic font-black text-base text-slate-950 mb-2 leading-snug">
                    {card.title}
                  </h3>

                  {/* Summary Callout (Vàng đậm giống Về Bản Đồ) */}
                  <div className="p-3 bg-amber-300 border-2 border-slate-900 rounded-xl shadow-comic-sm text-xs text-slate-950 font-semibold mb-3">
                    💡 <span className="font-black text-slate-950 mr-1">Tóm lược:</span>
                    <span className="italic">{card.summary}</span>
                  </div>

                  {/* Content with Auto-Highlight Term Tooltip */}
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    <HighlightedText text={card.content.replace(/^###.+?\n/, '').trim()} />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t-2 border-slate-900/15 flex items-center justify-between">
                  <span className="text-[11px] font-comic font-black uppercase text-indigo-950">
                    {card.chapter === 1 ? 'Mục II' : 'Mục III'}
                  </span>

                  <button
                    onClick={() => toggleLearned(card.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
                      isLearned
                        ? 'bg-emerald-300 text-emerald-950 border-slate-900 shadow-comic-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border-slate-900 shadow-comic-sm font-bold'
                    }`}
                  >
                    {isLearned ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
                        <span>Đã Học</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Đã Học</span>
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
