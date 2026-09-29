import React from 'react';
import { ArrowLeft, Lock, Star, Trophy, Award } from 'lucide-react';
import { transitionTo } from '../systems/transition';
import { useProgress } from '../systems/save';
import { getTotalStars, isQuizLevelUnlocked, REQUIRED_STARS_FOR_CHAPTER_2 } from '../systems/progress';
import quizData from '../data/quiz/chuong-1.json';

interface Props {
  onBackToCity: () => void;
}

export const QuizView: React.FC<Props> = ({ onBackToCity }) => {
  const [progress, saveProgress] = useProgress();

  const totalCh1Stars = getTotalStars(progress.quizStars, 1);

  const handleTestPassLevel = (levelIndex: number) => {
    // Helper để thử nghiệm chấm sao trực tiếp trong Phase 1
    const key = `c1_l${levelIndex}`;
    const nextStars = Math.min(3, ((progress.quizStars[key] ?? 0) + 1) % 4 || 1);
    saveProgress({
      quizStars: {
        ...progress.quizStars,
        [key]: nextStars,
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-slate-950/90 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              transitionTo(onBackToCity, 'Bản Đồ Thành Phố');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Thành Phố</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="font-black text-sm sm:text-base tracking-wide">
              TÒA THỬ THÁCH (Thung Lũng Trắc Nghiệm Angry Birds)
            </h1>
          </div>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-300 font-black text-xs">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{totalCh1Stars} / 30 Sao</span>
          <span className="text-[10px] text-amber-200/70 hidden sm:inline">
            (Cần {REQUIRED_STARS_FOR_CHAPTER_2} sao mở Chương 2)
          </span>
        </div>
      </div>

      {/* Main Level Path Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-wide">
              CHƯƠNG 1: HOÀN THIỆN THỂ CHẾ KTTT ĐỊNH HƯỚNG XHCN
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Vượt qua từng màn với tối thiểu 1 sao để mở khóa màn tiếp theo (Nhấp để thử nghiệm nhận sao)
            </p>
          </div>

          {/* 10 Level Buttons Grid / Path */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {quizData.levels.map((lvl) => {
              const isUnlocked = isQuizLevelUnlocked(progress.quizStars, 1, lvl.level);
              const stars = progress.quizStars[`c1_l${lvl.level}`] ?? 0;

              return (
                <div
                  key={lvl.level}
                  onClick={() => isUnlocked && handleTestPassLevel(lvl.level)}
                  className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all select-none cursor-pointer ${
                    isUnlocked
                      ? 'bg-slate-950/90 border-amber-500/80 hover:border-amber-400 hover:scale-105 shadow-[0_8px_0_rgba(180,83,9,0.4)]'
                      : 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Level Number */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2 shadow-inner ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? lvl.level : <Lock className="w-5 h-5 text-slate-500" />}
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
                    {lvl.questions.length} câu hỏi
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter 2 Locked Banner */}
          <div className="mt-10 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-300">
                  CHƯƠNG 2: CÁC QUAN HỆ LỢI ÍCH KINH TẾ Ở VIỆT NAM
                </h3>
                <p className="text-xs text-slate-500">
                  Đạt tối thiểu {REQUIRED_STARS_FOR_CHAPTER_2} sao ở Chương 1 để mở khóa
                </p>
              </div>
            </div>
            <div className="text-right font-black text-xs text-amber-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              {totalCh1Stars >= REQUIRED_STARS_FOR_CHAPTER_2 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Award className="w-4 h-4" /> ĐÃ ĐỦ ĐIỀU KIỆN
                </span>
              ) : (
                `Còn thiếu ${Math.max(0, REQUIRED_STARS_FOR_CHAPTER_2 - totalCh1Stars)} sao`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
