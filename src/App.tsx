import React, { useState, useEffect, useRef } from 'react';
import { Map, BookOpen, Trophy, Flame, Volume2, VolumeX, RotateCcw, Award, Star, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { CloudTransition } from './ui/CloudTransition';
import { KnowledgeView } from './ui/KnowledgeView';
import { QuizView } from './ui/QuizView';
import { BattleRPGOverlay } from './ui/BattleRPGOverlay';
import { OrientationOverlay } from './ui/OrientationOverlay';
import { AuxModal, ModalType } from './ui/AuxModal';
import { CharacterCreationModal } from './ui/CharacterCreationModal';
import { CharacterAvatar } from './ui/CharacterAvatar';
import { HubOverlay, TOTAL_QUIZ_STARS, TOTAL_BADGES } from './ui/HubOverlay';
import { VirtualDPad } from './ui/VirtualDPad';
import { LobbyView } from './ui/LobbyView';
import { transitionTo } from './systems/transition';
import { getTotalStars } from './systems/progress';
import { useProgress, resetProgress } from './systems/save';

export type AppView = 'lobby' | 'hub' | 'knowledge' | 'quiz' | 'battle';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('lobby');
  const activeViewRef = useRef<AppView>(activeView);
  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [knowledgeTargetCard, setKnowledgeTargetCard] = useState<string | null>(null);
  const [knowledgeSubTab, setKnowledgeSubTab] = useState<'library' | 'observatory' | 'archive'>('library');
  const [progress, saveProgress] = useProgress();
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  // Lắng nghe sự kiện yêu cầu chuyển cảnh từ Phaser Scenes
  useEffect(() => {
    const handleTransitionRequest = (data: {
      target: AppView | 'battle-khu2';
      subTab?: 'library' | 'observatory' | 'archive';
      label: string;
      variant?: 'default' | 'battle';
    }) => {
      // Chỉ nhận lệnh chuyển cảnh khi người chơi đang ở Sảnh Chờ, Bản Đồ Thành Phố hoặc Đấu Trường
      if (activeViewRef.current !== 'hub' && activeViewRef.current !== 'battle' && activeViewRef.current !== 'lobby') {
        return;
      }
      transitionTo(
        () => {
          if (data.subTab) {
            setKnowledgeSubTab(data.subTab);
          }
          if (data.target === 'battle-khu2' || data.target === 'battle') {
            setActiveView('battle');
            EventBus.emit('change-scene', 'OverworldScene');
          } else {
            setActiveView(data.target as AppView);
            if (data.target === 'hub') {
              EventBus.emit('change-scene', 'HubScene');
            }
          }
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

    const handleOpenCharacterCreation = () => {
      setShowCharacterCreation(true);
    };

    EventBus.on('request-transition', handleTransitionRequest);
    EventBus.on('locked-zone-clicked', handleLockedZone);
    EventBus.on('open-modal', handleOpenModal);
    EventBus.on('open-character-creation', handleOpenCharacterCreation);

    return () => {
      EventBus.removeListener('request-transition', handleTransitionRequest);
      EventBus.removeListener('locked-zone-clicked', handleLockedZone);
      EventBus.removeListener('open-modal', handleOpenModal);
      EventBus.removeListener('open-character-creation', handleOpenCharacterCreation);
    };
  }, []);

  const totalStars = getTotalStars(progress.quizStars);

  const handleNavClick = (view: AppView, label: string, variant: 'default' | 'battle' = 'default') => {
    if (activeView === view) return;
    transitionTo(() => {
      setActiveView(view);
      if (view === 'battle') {
        EventBus.emit('change-scene', 'OverworldScene');
      } else if (view === 'hub') {
        EventBus.emit('change-scene', 'HubScene');
      }
    }, label, variant);
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
      setShowCharacterCreation(true);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Top Header & HUD: Ẩn khi ở Sảnh Chờ để hiển thị toàn màn hình sảnh chờ như ảnh 1 */}
      {activeView !== 'lobby' && (
        <header
          className="h-11 sm:h-14 bg-slate-950/95 border-b border-slate-800 px-2 sm:px-6 flex items-center justify-between flex-shrink-0 z-20"
          style={{
            paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
            paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
          }}
        >
          {/* Logo & Game Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Biểu tượng Xã hội chủ nghĩa Tone Mono Đen Trắng */}
            <div className="relative w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-950 border-2 border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden shrink-0 group transition-transform hover:scale-105">
              <img
                src="/favicon.svg"
                alt="The Socialist Town Logo"
                className="w-full h-full object-contain p-0.5 filter drop-shadow"
              />
            </div>

            {/* Phong cách Typography cho "The Socialist Town" */}
            <div className="flex items-center gap-1.5 font-typography leading-none">
              <span className="font-extrabold text-xs sm:text-sm tracking-[0.16em] uppercase text-zinc-100 drop-shadow-sm">
                The Socialist
              </span>
              <span className="font-black text-[10px] sm:text-[11px] tracking-[0.22em] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-950 border border-white shadow-sm">
                Town
              </span>
            </div>
          </div>

          {/* Center Nav Buttons */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/80 p-0.5 sm:p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleNavClick('lobby', 'Sảnh Chờ Chính')}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-amber-400 hover:text-amber-200 hover:bg-slate-800"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sảnh Chờ</span>
            </button>

            <button
              onClick={() => handleNavClick('hub', 'Bản Đồ Thành Phố')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeView === 'hub'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bản Đồ</span>
            </button>

          <button
            onClick={() => handleNavClick('knowledge', 'Khu Tri Thức')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeView === 'knowledge'
                ? 'bg-indigo-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tri Thức</span>
          </button>

          <button
            onClick={() => handleNavClick('quiz', 'Tòa Thử Thách (Quiz Hub)')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeView === 'quiz'
                ? 'bg-purple-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Thử Thách</span>
          </button>

          <button
            onClick={() => handleNavClick('battle', 'Khu Trung Tâm • Đấu Trường Tình Huống', 'battle')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
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
          {/* Player Avatar Profile Pill */}
          <button
            onClick={() => setActiveModal('profile')}
            title={`Hồ sơ sinh viên: ${progress.playerName}`}
            className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-[11px] sm:text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-slate-700">
              <CharacterAvatar appearance={progress.appearance} size={22} className="shrink-0" />
            </div>
            <span className="max-w-[65px] sm:max-w-[95px] truncate font-bold">{progress.playerName}</span>
          </button>

          {/* Stars Count */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900 border border-slate-800 text-[11px] sm:text-xs font-black text-amber-400">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
            <span>{totalStars}/{TOTAL_QUIZ_STARS}</span>
          </div>

          {/* Badges Count */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900 border border-slate-800 text-[11px] sm:text-xs font-black text-rose-400">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>{progress.badges.length}/{TOTAL_BADGES}</span>
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
          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Bật toàn màn hình'}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors border border-slate-800 cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
      )}

      {/* Auxiliary Building Modals (Profile, Badges, Leaderboard, Settings) */}
      <AuxModal type={activeModal} onClose={() => setActiveModal(null)} />
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {activeView === 'lobby' && (
          <div className="relative z-10 w-full h-full">
            <LobbyView
              progress={progress}
              totalStars={totalStars}
              onStartGame={(targetScene = 'hub') => {
                handleNavClick(
                  targetScene,
                  targetScene === 'battle' ? 'Khu Trung Tâm • Đấu Trường Tình Huống' : 'Bản Đồ Thành Phố',
                  targetScene === 'battle' ? 'battle' : 'default'
                );
              }}
              onOpenCharacterCreation={() => setShowCharacterCreation(true)}
              onOpenModal={(type) => setActiveModal(type)}
              onUpdatePlayer={(updates) => {
                saveProgress(updates);
              }}
            />
          </div>
        )}

        {/* Canvas Phaser luôn được duy trì trong DOM để bảo toàn WebGL Context và scene đích */}
        <div
          className={`absolute inset-0 w-full h-full ${
            activeView === 'hub' || activeView === 'battle'
              ? 'opacity-100 pointer-events-auto z-0 visible'
              : 'opacity-0 pointer-events-none -z-50 invisible'
          }`}
        >
          <PhaserGame
            currentScene={activeView === 'battle' ? 'OverworldScene' : 'HubScene'}
            paused={activeView !== 'hub' && activeView !== 'battle'}
          />
        </div>
        {activeView === 'hub' && (
          <>
            <HubOverlay />
            <VirtualDPad />
          </>
        )}
        {activeView === 'battle' && (
          <>
            <BattleRPGOverlay
              onBackToCity={() => handleNavClick('hub', 'Bản Đồ Thành Phố')}
              onOpenKnowledgeSource={(source) => {
                transitionTo(() => {
                  setKnowledgeTargetCard(source);
                  setActiveView('knowledge');
                }, 'Xem Lại Kiến Thức');
              }}
            />
            <VirtualDPad />
          </>
        )}
        {activeView === 'knowledge' && (
          <div className="relative z-10 w-full h-full bg-dot-pattern">
            <KnowledgeView
              initialTab={knowledgeSubTab}
              initialCardId={knowledgeTargetCard}
              onBackToCity={() => handleNavClick('hub', 'Bản Đồ Thành Phố')}
            />
          </div>
        )}
        {activeView === 'quiz' && (
          <div className="relative z-10 w-full h-full bg-dot-pattern">
            <QuizView
              onBackToCity={() => handleNavClick('hub', 'Bản Đồ Thành Phố')}
              onOpenKnowledgeSource={(source) => {
                transitionTo(() => {
                  setKnowledgeTargetCard(source);
                  setActiveView('knowledge');
                }, 'Xem Lại Kiến Thức');
              }}
            />
          </div>
        )}
      </main>

      {/* Locked Zone Toast Notification */}
      {lockedNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border-2 border-amber-500 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span>⚠️ {lockedNotice}</span>
        </div>
      )}

      {/* Mobile Orientation Overlay */}
      <OrientationOverlay />
      {/* Cloud Transition Fullscreen Overlay */}
      <CloudTransition />

      {/* Character Creation Modal: Lớp phủ trên cùng tuyệt đối (z-[9999]), chặn mọi click nền */}
      {showCharacterCreation && (
        <CharacterCreationModal
          currentName={progress.playerName}
          currentGender={progress.playerGender || 'male'}
          currentSkin={progress.playerSkin}
          currentAppearance={progress.appearance}
          isFirstTime={!progress.characterCreated}
          onSave={(data) => {
            saveProgress({
              playerName: data.playerName,
              playerGender: data.playerGender,
              playerSkin: data.playerSkin,
              appearance: data.appearance,
              characterCreated: true,
            });
            setShowCharacterCreation(false);
            if (activeView === 'lobby') {
              handleNavClick('hub', 'Bản Đồ Thành Phố');
            }
          }}
          onClose={() => {
            setShowCharacterCreation(false);
          }}
        />
      )}
    </div>
  );
};
