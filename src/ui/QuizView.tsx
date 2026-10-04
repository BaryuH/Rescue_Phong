import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Trophy, Award, Play } from 'lucide-react';
import { useProgress } from '../systems/save';
import { getTotalStars, isQuizLevelUnlocked, isChapter2Unlocked } from '../systems/progress';
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
        key={`${activeChapter}-${selectedLevel}`}
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
          } else if (activeChapter === 1) {
            setActiveChapter(2);
            setSelectedLevel(1);
          } else {
            setSelectedLevel(null);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-dot-pattern text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Bar - The Growth G3 Comic Style */}
      <div className="h-14 bg-white border-b-2.5 border-slate-900 px-4 flex items-center justify-between flex-shrink-0 z-20 shadow-comic-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-300 hover:bg-amber-200 active:scale-95 text-xs font-comic font-black transition-all cursor-pointer text-slate-950 shadow-comic-sm btn-comic-press"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Thành Phố</span>
          </button>
          <div className="h-5 w-0.5 bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <h1 className="font-comic font-black text-xs sm:text-sm tracking-wide text-slate-950 uppercase">
                THỬ THÁCH (QUIZ ARCADE)
              </h1>
              {/* <span className="text-[10px] text-slate-500 font-bold hidden sm:block">
                Thung Lũng Trắc Nghiệm Angry Birds 3 Sao
              </span> */}
            </div>
          </div>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border-2 border-slate-900 rounded-xl text-amber-950 font-comic font-black text-xs shadow-comic-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>
            {activeChapter === 1 ? totalCh1Stars : totalCh2Stars} / 30 Sao (Mục {activeChapter === 1 ? 'II' : 'III'})
          </span>
        </div>
      </div>

      {/* Chapter Tabs - Comic Switchers */}
      <div className="bg-white/80 border-b-2 border-slate-900 px-4 py-2.5 flex items-center justify-center gap-3 flex-shrink-0">
        <button
          onClick={() => setActiveChapter(1)}
          className={`px-4 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
            activeChapter === 1
              ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
              : 'bg-white text-slate-700 hover:bg-amber-50 border-slate-900 font-bold'
          }`}
        >
          Mục II: Hoàn Thiện Thể Chế ({totalCh1Stars}/30 ⭐)
        </button>

        <button
          onClick={() => setActiveChapter(2)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-comic font-black transition-all cursor-pointer border-2 btn-comic-press ${
            activeChapter === 2
              ? 'bg-purple-300 text-slate-950 border-slate-900 shadow-comic-sm'
              : 'bg-white text-slate-700 hover:bg-purple-50 border-slate-900 font-bold'
          }`}
        >
          <span>Mục III: Quan Hệ Lợi Ích ({totalCh2Stars}/30 ⭐)</span>
        </button>
      </div>

      {/* Main Level Path Grid Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar flex flex-col items-center">
        <div className="max-w-5xl w-full my-auto py-2">
          {/* Header Banner */}
          <div className="text-center mb-5">
            <h2 className="text-base sm:text-xl font-comic font-black text-slate-950 uppercase tracking-wide">
              {currentChapterData.title}
            </h2>
            <p className="text-xs text-slate-600 font-bold mt-1">
              Bắn trúng 5 câu hỏi ngẫu nhiên và giành trọn 3 sao vàng!
            </p>
          </div>

          {/* 10 Level Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4.5">
            {currentChapterData.levels.map((lvl) => {
              const isUnlocked = isQuizLevelUnlocked(progress.quizStars, activeChapter, lvl.level);
              const stars = progress.quizStars[`c${activeChapter}_l${lvl.level}`] ?? 0;

              return (
                <div
                  key={lvl.level}
                  onClick={() => isUnlocked && setSelectedLevel(lvl.level)}
                  className={`relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2.5 transition-all select-none group h-full min-h-[200px] sm:min-h-[220px] ${
                    isUnlocked
                      ? 'bg-white border-slate-900 shadow-comic hover:shadow-comic-lg hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-slate-100/90 border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Level Number / Icon Badge */}
                  <div
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-comic font-black text-base mb-1.5 transition-transform group-hover:scale-105 shrink-0 ${
                      isUnlocked
                        ? activeChapter === 1
                          ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-comic-sm'
                          : 'bg-purple-300 text-slate-950 border-slate-900 shadow-comic-sm'
                        : 'bg-slate-200 text-slate-400 border-slate-300'
                    }`}
                  >
                    {isUnlocked ? (
                      stars > 0 ? (
                        lvl.level
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5 text-slate-950" />
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Level Title - Hiển thị đầy đủ, không giới hạn dòng, không che khuất */}
                  <div className="w-full flex-1 flex flex-col items-center justify-center px-0.5 py-1 min-h-[3.25rem] my-auto">
                    <span className="text-[10px] font-comic font-black text-purple-700 uppercase tracking-wider mb-0.5">
                      Màn {lvl.level}
                    </span>
                    <h3 className="text-[11px] sm:text-xs font-comic font-black text-center text-slate-950 leading-snug break-words">
                      {lvl.title.replace(/^Màn \d+:\s*/, '')}
                    </h3>
                  </div>

                  {/* Bottom: 3 Stars & Random Question count badge */}
                  <div className="flex flex-col items-center gap-1.5 mt-2 shrink-0 w-full">
                    {/* 3 Stars */}
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-slate-900/15">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 transition-all ${
                            stars >= starIdx
                              ? 'fill-amber-400 text-amber-500 drop-shadow-[0_1px_2px_rgba(245,158,11,0.6)]'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Random Question count badge */}
                    <div className="text-[9px] font-comic font-black bg-purple-100 text-purple-950 px-2 py-0.5 rounded-md border border-slate-900 whitespace-nowrap">
                      5/{lvl.questions.length} câu ngẫu nhiên
                    </div>
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
