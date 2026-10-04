import React, { useState } from 'react';
import { Search, Layers, CheckCircle2, Circle, Sparkles, RotateCw, BookOpen } from 'lucide-react';
import termsData from '../../data/terms.json';
import { useProgress } from '../../systems/save';
import { formatSectionNumber, removeVietnameseTones } from './TermTooltip';

interface Props {
  onSelectTerm?: (termId: string) => void;
}

export const GlossaryView: React.FC<Props> = () => {
  const [progress, saveProgress] = useProgress();
  const [search, setSearch] = useState('');
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'collected' | 'uncollected'>('all');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const totalTerms = termsData.length;
  const collectedCount = progress.collectedTerms.length;
  const percentComplete = Math.round((collectedCount / totalTerms) * 100);

  const toggleCollected = (termId: string) => {
    const isCollected = progress.collectedTerms.includes(termId);
    const updated = isCollected
      ? progress.collectedTerms.filter((id) => id !== termId)
      : [...progress.collectedTerms, termId];
    saveProgress({ collectedTerms: updated });
  };

  const toggleFlip = (termId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [termId]: !prev[termId],
    }));
  };

  const filteredTerms = termsData.filter((item) => {
    const matchCh = chapterFilter === 'all' || item.chapter === chapterFilter;
    const isCollected = progress.collectedTerms.includes(item.id);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'collected' && isCollected) ||
      (statusFilter === 'uncollected' && !isCollected);

    if (!search) return matchCh && matchStatus;

    const normalizedQuery = removeVietnameseTones(search);
    const normalizedTerm = removeVietnameseTones(item.term);
    const normalizedDef = removeVietnameseTones(item.definition);
    const normalizedSource = removeVietnameseTones(item.source);
    const normalizedFormattedSource = removeVietnameseTones(formatSectionNumber(item.source));

    const matchQuery =
      normalizedTerm.includes(normalizedQuery) ||
      normalizedDef.includes(normalizedQuery) ||
      normalizedSource.includes(normalizedQuery) ||
      normalizedFormattedSource.includes(normalizedQuery);

    return matchCh && matchStatus && matchQuery;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-dot-pattern text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Rose / Comic Banner (The Growth G3 Style) */}
      <div className="p-3 sm:p-4 bg-white/90 border-b-2.5 border-slate-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-comic-sm">
        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 bg-rose-200 border-2 border-slate-900 rounded-xl px-3.5 py-2 shadow-comic-sm">
            <Layers className="w-5 h-5 text-rose-900 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-comic font-black text-rose-950 uppercase tracking-wide">
                BẢO TÀNG THUẬT NGỮ (83 TỪ KHÓA)
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-32 sm:w-40 h-3 bg-white border border-slate-900 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
                <span className="font-comic font-black text-xs text-rose-950">
                  {collectedCount}/{totalTerms} ({percentComplete}%)
                </span>
              </div>
            </div>
          </div>

          {collectedCount === totalTerms && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-300 text-slate-950 border-2 border-slate-900 rounded-xl font-comic font-black text-xs shadow-comic-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>Đạt danh hiệu: Pháp Sư Thuật Ngữ!</span>
            </div>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlashcardMode(!flashcardMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 shadow-comic-sm btn-comic-press ${
              flashcardMode
                ? 'bg-rose-400 text-slate-950 border-slate-900'
                : 'bg-white text-slate-800 hover:bg-rose-50 border-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-rose-900" />
            <span>{flashcardMode ? 'Danh Sách' : 'Flashcard'}</span>
          </button>
        </div>
      </div>

      {/* The Growth G3 Search Bar & Filters */}
      <div className="p-3 bg-white/70 border-b-2 border-slate-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Nhập tên thuật ngữ không dấu (VD: 'the che', 'loi ich', 'thue')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-amber-50 text-slate-950 text-xs pl-9 pr-4 py-2 rounded-xl border-2 border-slate-900 font-bold focus:outline-none focus:bg-white shadow-comic-sm"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Chapter Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-slate-900 shadow-comic-sm">
            <button
              onClick={() => setChapterFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-comic font-black text-xs transition border ${
                chapterFilter === 'all'
                  ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-transparent font-bold'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setChapterFilter(1)}
              className={`px-2.5 py-1 rounded-lg font-comic font-black text-xs transition border ${
                chapterFilter === 1
                  ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-transparent font-bold'
              }`}
            >
              Mục II
            </button>
            <button
              onClick={() => setChapterFilter(2)}
              className={`px-2.5 py-1 rounded-lg font-comic font-black text-xs transition border ${
                chapterFilter === 2
                  ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-transparent font-bold'
              }`}
            >
              Mục III
            </button>
          </div>

          {/* Collection Status */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-slate-900 shadow-comic-sm">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-comic font-black text-xs transition border ${
                statusFilter === 'all'
                  ? 'bg-rose-300 text-slate-950 border-slate-900 shadow-comic-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-transparent font-bold'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setStatusFilter('collected')}
              className={`px-2.5 py-1 rounded-lg font-comic font-black text-xs transition border ${
                statusFilter === 'collected'
                  ? 'bg-rose-300 text-slate-950 border-slate-900 shadow-comic-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-transparent font-bold'
              }`}
            >
              Đã Sưu Tầm ({collectedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Term Cards Grid - The Growth G3 Rose/Amber Cards */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredTerms.map((item) => {
            const isCollected = progress.collectedTerms.includes(item.id);
            const isFlipped = !!flippedCards[item.id];

            if (flashcardMode) {
              return (
                <div
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="h-[210px] w-full [perspective:1000px] cursor-pointer select-none"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                      isFlipped ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* Mặt trước: Thuật ngữ */}
                    <div className="absolute inset-0 [backface-visibility:hidden] bg-white border-2.5 border-slate-900 rounded-2xl p-5 shadow-comic flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold border-b border-slate-900/15 pb-2">
                        <span className="text-[10px] font-comic font-black uppercase bg-indigo-100 text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-md shadow-comic-sm">
                          {formatSectionNumber(item.source)}
                        </span>
                        <span className="text-rose-600 font-comic font-black">
                          Mặt Trước: Thuật Ngữ
                        </span>
                      </div>

                      <div className="my-auto py-2 text-center">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">
                          Nhấp để lật xem định nghĩa
                        </span>
                        <h3 className="font-comic font-black text-base sm:text-lg text-rose-700 uppercase tracking-wide">
                          {item.term}
                        </h3>
                        <span className="inline-block mt-2 text-[9px] font-comic font-black uppercase bg-indigo-100 text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-md">
                          {item.chapter === 1 ? 'Mục II' : 'Mục III'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-comic font-black border-t border-slate-900/15 pt-2">
                        <span className="text-slate-500 font-bold">Lật thẻ ↻</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollected(item.id);
                          }}
                          className="text-rose-600 hover:text-rose-800 font-black flex items-center gap-1 cursor-pointer"
                        >
                          {isCollected ? '✓ Đã Sưu Tầm' : '+ Thu Thập Sổ'}
                        </button>
                      </div>
                    </div>

                    {/* Mặt sau: Định nghĩa (xoay 180deg) */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-amber-100 border-2.5 border-slate-900 rounded-2xl p-5 shadow-comic flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold border-b border-slate-900/15 pb-2">
                        <span className="text-rose-700 font-comic font-black uppercase truncate max-w-[170px]">
                          {item.term}
                        </span>
                        <span className="text-indigo-950 font-comic font-black">
                          Mặt Sau: Định Nghĩa
                        </span>
                      </div>

                      <div className="my-auto overflow-y-auto max-h-[110px] no-scrollbar py-1">
                        <p className="text-xs text-slate-900 leading-relaxed text-left font-medium bg-white/90 p-2.5 rounded-xl border border-slate-900/20">
                          {item.definition}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-comic font-black border-t border-slate-900/15 pt-2">
                        <span className="text-slate-500 font-bold">Lật lại ↺</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollected(item.id);
                          }}
                          className="text-rose-600 hover:text-rose-800 font-black flex items-center gap-1 cursor-pointer"
                        >
                          {isCollected ? '✓ Đã Sưu Tầm' : '+ Thu Thập Sổ'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between select-none ${
                  isCollected
                    ? 'bg-rose-50/80 border-rose-900 shadow-comic-rose'
                    : 'bg-amber-50/70 border-slate-900 shadow-comic-sm hover:shadow-comic'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-900/15">
                    <span className="text-[10px] font-comic font-black uppercase bg-indigo-200 text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-md shadow-comic-sm">
                      {formatSectionNumber(item.source)}
                    </span>
                    <span className="text-[10px] font-comic font-black text-rose-700">
                      {item.chapter === 1 ? 'Mục II' : 'Mục III'}
                    </span>
                  </div>

                  <h3 className="font-comic font-black text-sm sm:text-base text-slate-950 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{item.term}</span>
                  </h3>

                  <div className="p-3 bg-white/80 rounded-xl border border-slate-900/15 text-xs text-slate-800 font-medium leading-relaxed">
                    {item.definition}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-slate-900/15 flex items-center justify-between">
                  <span className="text-[10px] font-comic font-black uppercase text-slate-500">
                    Sổ Thuật Ngữ
                  </span>
                  <button
                    onClick={() => toggleCollected(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
                      isCollected
                        ? 'bg-rose-300 text-rose-950 border-slate-900 shadow-comic-sm'
                        : 'bg-white text-slate-700 hover:bg-rose-100 border-slate-900 shadow-comic-sm font-bold'
                    }`}
                  >
                    {isCollected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-950" />
                        <span>Đã Lưu Sổ</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ghi Vào Sổ</span>
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
