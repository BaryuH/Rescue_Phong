import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, GitBranch, Layers, Sparkles } from 'lucide-react';
import { LessonReader } from './knowledge/LessonReader';
import { MindMapView } from './knowledge/MindMapView';
import { GlossaryView } from './knowledge/GlossaryView';

export type KnowledgeSubTab = 'library' | 'observatory' | 'archive';

interface Props {
  onBackToCity: () => void;
  initialTab?: KnowledgeSubTab;
  initialCardId?: string | null;
}

export const KnowledgeView: React.FC<Props> = ({
  onBackToCity,
  initialTab = 'library',
  initialCardId = null,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<KnowledgeSubTab>(initialTab);
  const [targetCardId, setTargetCardId] = useState<string | null>(initialCardId);

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectCardFromMindmap = (cardId: string) => {
    setTargetCardId(cardId);
    setActiveSubTab('library');
  };

  return (
    <div className="w-full h-full flex flex-col bg-dot-pattern text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Comic Navigation Bar */}
      <div className="h-14 bg-white border-b-2.5 border-slate-900 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-comic-sm">
        {/* Back Button & Building Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-300 hover:bg-amber-200 active:scale-95 text-xs font-comic font-black transition-all cursor-pointer text-slate-950 shadow-comic-sm btn-comic-press"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Về Bản Đồ</span>
          </button>
          <div className="h-5 w-0.5 bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🏛️</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-comic font-black text-xs sm:text-sm tracking-wide text-slate-950 uppercase">
                  THƯ VIỆN TRI THỨC
                </h1>
                {/* <span className="text-[9px] font-comic px-1.5 py-0.2 bg-indigo-100 text-indigo-950 border border-slate-900 rounded font-black hidden md:inline">
                  CH.5
                </span> */}
              </div>
              {/* <span className="text-[10px] text-slate-500 font-bold hidden sm:block">
                Kinh tế Chính trị Mác - Lênin
              </span> */}
            </div>
          </div>
        </div>

        {/* 3 SubTab Switcher (The Growth G3 Comic Tabs) */}
        <div className="flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border-2 border-slate-900 shadow-comic-sm">
          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
              activeSubTab === 'library'
                ? 'bg-indigo-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 border-transparent font-bold'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-900" />
            <span>THƯ VIỆN</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">(33)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('observatory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
              activeSubTab === 'observatory'
                ? 'bg-emerald-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border-transparent font-bold'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-900" />
            <span>SƠ ĐỒ TƯ DUY</span>
          </button>

          <button
            onClick={() => setActiveSubTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
              activeSubTab === 'archive'
                ? 'bg-rose-300 text-slate-950 border-slate-900 shadow-comic-sm'
                : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-900 border-transparent font-bold'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-900" />
            <span>BẢO TÀNG</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">(83)</span>
          </button>
        </div>
      </div>

      {/* View Content Area */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        {activeSubTab === 'library' && (
          <LessonReader initialCardId={targetCardId} />
        )}
        {activeSubTab === 'observatory' && (
          <MindMapView onSelectCard={handleSelectCardFromMindmap} />
        )}
        {activeSubTab === 'archive' && <GlossaryView />}
      </div>
    </div>
  );
};
