import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Trophy, Award, Play } from 'lucide-react';
import { transitionTo } from '../systems/transition';
import { useProgress } from '../systems/save';
import { getTotalStars, isQuizLevelUnlocked, REQUIRED_STARS_FOR_CHAPTER_2, isChapter2Unlocked } from '../systems/progress';
import ch1QuizData from '../data/quiz/chuong-1.json';
import ch2QuizData from '../data/quiz/chuong-2.json';
import { QuizPlay } from './quiz/QuizPlay';

interface Props {
  onBackToCity: () => void;
  onOpenKnowledgeSource?: (sourceId: string) => void;
}

export const QuizView: React.FC<Props> = ({ onBackToCity, onOpenKnowledgeSource }) => {
  const [progress] = useProgress();
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const totalCh1Stars = getTotalStars(progress.quizStars, 1);
  const totalCh2Stars = getTotalStars(progress.quizStars, 2);
  const ch2Unlocked = isChapter2Unlocked(progress.quizStars);

  const currentChapterData = activeChapter === 1 ? ch1QuizData : ch2QuizData;

  if (selectedLevel !== null) {
    return (
      <QuizPlay
        chapter={activeChapter}
        level={selectedLevel}
        onBackToLevelSelect={() => setSelectedLevel(null)}
        onOpenKnowledgeSource={(source) => {
          if (onOpenKnowledgeSource) {
            onOpenKnowledgeSource(source);
          }
        }}
        onNextLevel={() => {
          if (selectedLevel < 10) {
            setSelectedLevel(selectedLevel + 1);
          } else {
            setSelectedLevel(null);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <div className="h-14 bg-slate-950/90 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Thành Phố</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="font-black text-sm sm:text-base tracking-wide">
              THỬ THÁCH (Thung Lũng Trắc Nghiệm Angry Birds)
            </h1>
          </div>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-300 font-black text-xs">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>
            {activeChapter === 1 ? totalCh1Stars : totalCh2Stars} / 30 Sao (Chương {activeChapter})
          </span>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2 flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveChapter(1)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeChapter === 1
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Chương 1: Hoàn Thiện Thể Chế ({totalCh1Stars}/30 ⭐)
        </button>

        <button
          onClick={() => setActiveChapter(2)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeChapter === 2
              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>Chương 2: Quan Hệ Lợi Ích ({totalCh2Stars}/30 ⭐)</span>
        </button>
      </div>

      {/* Main Level Path Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-wide uppercase">
              {currentChapterData.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Bắn 5 câu hỏi ngẫu nhiên và chinh phục 3 sao để chứng tỏ bản lĩnh kiến thức!
            </p>
          </div>

          {/* 10 Level Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {currentChapterData.levels.map((lvl) => {
              const isUnlocked = isQuizLevelUnlocked(progress.quizStars, activeChapter, lvl.level);
              const stars = progress.quizStars[`c${activeChapter}_l${lvl.level}`] ?? 0;

              return (
                <div
                  key={lvl.level}
                  onClick={() => isUnlocked && setSelectedLevel(lvl.level)}
                  className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all select-none cursor-pointer group ${
                    isUnlocked
                      ? activeChapter === 1
                        ? 'bg-slate-950/90 border-amber-500/80 hover:border-amber-400 hover:scale-105 shadow-[0_8px_0_rgba(180,83,9,0.4)]'
                        : 'bg-slate-950/90 border-purple-500/80 hover:border-purple-400 hover:scale-105 shadow-[0_8px_0_rgba(147,51,234,0.4)]'
                      : 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Level Number */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2 shadow-inner transition-transform group-hover:scale-110 ${
                      isUnlocked
                        ? activeChapter === 1
                          ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950'
                          : 'bg-gradient-to-b from-purple-400 to-purple-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      stars > 0 ? (
                        lvl.level
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  {/* Level Title */}
                  <span className="text-[11px] font-bold text-center text-slate-200 line-clamp-2 h-8 flex items-center">
                    {lvl.title.replace(/^Màn \d+:\s*/, '')}
                  </span>

                  {/* 3 Stars */}
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 transition-colors ${
                          stars >= starIdx
                            ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Question count badge */}
                  <div className="mt-2 text-[9px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    5/{lvl.questions.length} câu ngẫu nhiên
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
