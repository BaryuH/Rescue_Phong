import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Layers, Search, Sparkles } from 'lucide-react';
import { transitionTo } from '../systems/transition';
import termsData from '../data/terms.json';
import cardsData from '../data/knowledge/cards.json';

interface Props {
  onBackToCity: () => void;
}

export const KnowledgeView: React.FC<Props> = ({ onBackToCity }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'terms'>('cards');
  const [search, setSearch] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');

  const filteredCards = cardsData.filter((card) => {
    const matchCh = selectedChapter === 'all' || card.chapter === selectedChapter;
    const matchQ =
      !search ||
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.content.toLowerCase().includes(search.toLowerCase());
    return matchCh && matchQ;
  });

  const filteredTerms = termsData.filter((term) => {
    const matchCh = selectedChapter === 'all' || term.chapter === selectedChapter;
    const matchQ =
      !search ||
      term.term.toLowerCase().includes(search.toLowerCase()) ||
      term.definition.toLowerCase().includes(search.toLowerCase());
    return matchCh && matchQ;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-slate-950/90 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              transitionTo(onBackToCity, 'Bản Đồ Thành Phố');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-emerald-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Thành Phố</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h1 className="font-black text-sm sm:text-base tracking-wide">
              KHU TRI THỨC (Thư Viện & Sổ Thuật Ngữ)
            </h1>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'cards'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            33 Thẻ Bài Học
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'terms'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            83 Thuật Ngữ
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'cards' ? 'Tìm bài học, nội dung...' : 'Tìm thuật ngữ, định nghĩa...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedChapter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              selectedChapter === 'all'
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedChapter(1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              selectedChapter === 1
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Chương 1: Thể Chế
          </button>
          <button
            onClick={() => setSelectedChapter(2)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              selectedChapter === 2
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Chương 2: Quan Hệ Lợi Ích
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
        {activeTab === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-lg group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {card.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {card.wordCount} chữ
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-slate-100 group-hover:text-emerald-300 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed whitespace-pre-line line-clamp-6">
                    {card.content.replace(/^###.+?\n/, '').trim()}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Chương {card.chapter}</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Thẻ tri thức</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
            {filteredTerms.map((t) => (
              <div
                key={t.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 transition-all shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-black text-sm text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.term}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {t.source}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {t.definition}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
