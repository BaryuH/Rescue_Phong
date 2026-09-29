import React, { useState } from 'react';
import { Search, Layers, CheckCircle2, Circle, Sparkles, RotateCw, BookOpen } from 'lucide-react';
import termsData from '../../data/terms.json';
import { useProgress } from '../../systems/save';

// Hàm chuẩn hóa loại bỏ dấu tiếng Việt để tìm kiếm không dấu
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

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

    const matchQuery =
      normalizedTerm.includes(normalizedQuery) ||
      normalizedDef.includes(normalizedQuery) ||
      normalizedSource.includes(normalizedQuery);

    return matchCh && matchStatus && matchQuery;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Pokédex Stats Banner */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Bộ Sưu Tập Thuật Ngữ Pokédex
            </div>
            <div className="flex items-center gap-2">
              <div className="w-36 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${Math.round((collectedCount / totalTerms) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs font-black text-amber-400">
                {collectedCount}/{totalTerms} ({Math.round((collectedCount / totalTerms) * 100)}%)
              </span>
            </div>
          </div>

          {collectedCount === totalTerms && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-500 font-bold text-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Đạt danh hiệu: Nhà Thông Thái Thể Chế!</span>
            </div>
          )}
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlashcardMode(!flashcardMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              flashcardMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Chế Độ Flashcard</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm không dấu (VD: 'the che', 'loi ich', 'thue')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Chapter Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChapterFilter('all')}
              className={`px-2 py-1 rounded-lg font-bold ${
                chapterFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'text-slate-400'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setChapterFilter(1)}
              className={`px-2 py-1 rounded-lg font-bold ${
                chapterFilter === 1 ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
              }`}
            >
              Chương 1
            </button>
            <button
              onClick={() => setChapterFilter(2)}
              className={`px-2 py-1 rounded-lg font-bold ${
                chapterFilter === 2 ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
              }`}
            >
              Chương 2
            </button>
          </div>

          {/* Collection Status */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-lg font-bold ${
                statusFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'text-slate-400'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('collected')}
              className={`px-2 py-1 rounded-lg font-bold ${
                statusFilter === 'collected' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400'
              }`}
            >
              Đã sưu tầm
            </button>
          </div>
        </div>
      </div>

      {/* Main Term Cards Grid */}
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
                  className={`min-h-[170px] rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between select-none shadow-md ${
                    isFlipped
                      ? 'bg-slate-950 border-amber-500 text-slate-200'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{item.source}</span>
                    <span className="text-amber-400 font-bold">
                      {isFlipped ? 'Mặt Sau: Định Nghĩa' : 'Mặt Trước: Thuật Ngữ'}
                    </span>
                  </div>

                  <div className="my-auto py-2 text-center">
                    {!isFlipped ? (
                      <h3 className="font-black text-base text-amber-300">
                        {item.term}
                      </h3>
                    ) : (
                      <p className="text-xs text-slate-200 leading-relaxed text-left">
                        {item.definition}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>Nhấp để lật thẻ ↻</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollected(item.id);
                      }}
                      className="text-amber-400 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isCollected ? '✓ Đã sưu tầm' : '+ Thu thập'}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all shadow-md ${
                  isCollected
                    ? 'bg-slate-950/80 border-amber-500/60'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Chương {item.chapter}
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-amber-300 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{item.term}</span>
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.definition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Sổ Pokédex KTCT
                  </span>
                  <button
                    onClick={() => toggleCollected(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCollected
                        ? 'bg-amber-950 text-amber-300 border border-amber-600'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {isCollected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Đã lưu sổ</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ghi vào sổ</span>
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
