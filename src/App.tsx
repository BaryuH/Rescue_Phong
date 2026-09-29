import React, { useState, useEffect } from 'react';
import { Map, BookOpen, Trophy, Flame, Volume2, VolumeX, RotateCcw, Award, Star } from 'lucide-react';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { CloudTransition } from './ui/CloudTransition';
import { KnowledgeView } from './ui/KnowledgeView';
import { QuizView } from './ui/QuizView';
import { BattleView } from './ui/BattleView';
import { AuxModal, ModalType } from './ui/AuxModal';
import { transitionTo } from './systems/transition';
import { getTotalStars } from './systems/progress';
import { useProgress, resetProgress } from './systems/save';

export type AppView = 'hub' | 'knowledge' | 'quiz' | 'battle';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('hub');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [progress, saveProgress] = useProgress();
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Lắng nghe sự kiện yêu cầu chuyển cảnh từ Phaser Scenes
  useEffect(() => {
    const handleTransitionRequest = (data: {
      target: AppView;
      label: string;
      variant?: 'default' | 'battle';
    }) => {
      transitionTo(
        () => {
          setActiveView(data.target);
        },
        data.label,
        data.variant || 'default'
      );
    };

    const handleLockedZone = (data: { zone: string; message: string }) => {
      setLockedNotice(data.message);
      setTimeout(() => setLockedNotice(null), 4000);
    };

    const handleOpenModal = (data: { type: ModalType }) => {
      setActiveModal(data.type);
    };

    EventBus.on('request-transition', handleTransitionRequest);
    EventBus.on('locked-zone-clicked', handleLockedZone);
    EventBus.on('open-modal', handleOpenModal);

    return () => {
      EventBus.removeListener('request-transition', handleTransitionRequest);
      EventBus.removeListener('locked-zone-clicked', handleLockedZone);
      EventBus.removeListener('open-modal', handleOpenModal);
    };
  }, []);

  const totalStars = getTotalStars(progress.quizStars);

  const handleNavClick = (view: AppView, label: string, variant: 'default' | 'battle' = 'default') => {
    if (activeView === view) return;
    transitionTo(() => setActiveView(view), label, variant);
  };

  const handleToggleSound = () => {
    saveProgress({
      settings: {
        ...progress.settings,
        soundEnabled: !progress.settings.soundEnabled,
      },
    });
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ học tập và game không?')) {
      resetProgress();
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Top Header & HUD */}
      <header className="h-14 bg-slate-950/95 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        {/* Logo & Game Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center shadow-sm">
            RP
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm tracking-wide text-slate-100 leading-tight">
              RESCUE PHONG
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
              KTCT Mác - Lênin • Chương 5
            </div>
          </div>
        </div>

        {/* Center Nav Buttons */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleNavClick('hub', 'Bản Đồ Thành Phố')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'hub'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Bản Đồ</span>
          </button>

          <button
            onClick={() => handleNavClick('knowledge', 'Khu Tri Thức')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'knowledge'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tri Thức</span>
          </button>

          <button
            onClick={() => handleNavClick('quiz', 'Tòa Thử Thách (Quiz Hub)')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'quiz'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Thử Thách</span>
          </button>

          <button
            onClick={() => handleNavClick('battle', 'Đấu Trường Thể Chế', 'battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'battle'
                ? 'bg-rose-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Đấu Trường</span>
          </button>
        </nav>

        {/* HUD Progress Badges & Controls */}
        <div className="flex items-center gap-2">
          {/* Stars Count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{totalStars}/30</span>
          </div>

          {/* Badges Count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-rose-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{progress.badges.length}/3</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={progress.settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800 cursor-pointer"
          >
            {progress.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset progress */}
          <button
            onClick={handleReset}
            title="Đặt lại tiến độ"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors border border-slate-800 cursor-pointer hidden sm:block"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      {/* Auxiliary Building Modals (Profile, Badges, Leaderboard, Settings) */}
      <AuxModal type={activeModal} onClose={() => setActiveModal(null)} />
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {activeView === 'hub' && <PhaserGame />}
        {activeView === 'knowledge' && (
          <KnowledgeView onBackToCity={() => setActiveView('hub')} />
        )}
        {activeView === 'quiz' && (
          <QuizView onBackToCity={() => setActiveView('hub')} />
        )}
        {activeView === 'battle' && (
          <BattleView onBackToCity={() => setActiveView('hub')} />
        )}
      </main>

      {/* Locked Zone Toast Notification */}
      {lockedNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border-2 border-amber-500 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span>⚠️ {lockedNotice}</span>
        </div>
      )}

      {/* Cloud Transition Fullscreen Overlay */}
      <CloudTransition />
    </div>
  );
};
