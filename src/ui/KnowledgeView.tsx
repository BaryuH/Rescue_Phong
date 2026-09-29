import React, { useState } from 'react';
import { ArrowLeft, BookOpen, GitBranch, Layers } from 'lucide-react';
import { transitionTo } from '../systems/transition';
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

  const handleSelectCardFromMindmap = (cardId: string) => {
    setTargetCardId(cardId);
    setActiveSubTab('library');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-slate-950/95 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              transitionTo(onBackToCity, 'Bản Đồ Thành Phố');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-emerald-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Bản Đồ</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🏛️</span>
            <div>
              <h1 className="font-black text-xs sm:text-sm tracking-wide text-slate-100 uppercase">
                KHU TRI THỨC
              </h1>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                Kinh tế Chính trị Mác - Lênin • Chương 5
              </span>
            </div>
          </div>
        </div>

        {/* 3 SubTab Switcher (3 Công trình) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'library'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thư Viện (33 Thẻ)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('observatory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'observatory'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Đài Quan Sát (Sơ Đồ)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'archive'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Nhà Lưu Trữ (83 Thuật Ngữ)</span>
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
