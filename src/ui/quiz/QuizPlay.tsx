import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Star, RotateCcw, ArrowRight, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useProgress } from '../../systems/save';
import ch1QuizData from '../../data/quiz/chuong-1.json';
import ch2QuizData from '../../data/quiz/chuong-2.json';
interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
  source: string;
}

interface Props {
  chapter: number;
  level: number;
  onBackToLevelSelect: () => void;
  onOpenKnowledgeSource: (sourceId: string) => void;
  onNextLevel?: () => void;
}

export const QuizPlay: React.FC<Props> = ({
  chapter,
  level,
  onBackToLevelSelect,
  onOpenKnowledgeSource,
  onNextLevel,
}) => {
  const [progress, saveProgress] = useProgress();

  // Tìm level data từ JSON tương ứng theo chương
  const levelData = useMemo(() => {
    const chapterData = chapter === 1 ? ch1QuizData : ch2QuizData;
    return chapterData.levels.find((l) => l.level === level) || chapterData.levels[0];
  }, [chapter, level]);

  // Rút ngẫu nhiên đúng 5 câu hỏi từ ngân hàng câu hỏi
  const questions: QuestionItem[] = useMemo(() => {
    const pool = [...levelData.questions];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }, [levelData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQ = questions[currentIndex];

  // Đếm ngược 30 giây mỗi câu
  useEffect(() => {
    if (isAnswered || isFinished) return;

    if (timeLeft <= 0) {
      // Hết giờ coi như trả lời sai
      setIsAnswered(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isFinished]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.answer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      // Hoàn thành cả 5 câu -> Chấm sao
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);

    // Tính số sao phong cách Angry Birds
    // 5/5: 3 sao, 4/5: 2 sao, 3/5: 1 sao, <3: 0 sao
    let starsEarned = 0;
    if (correctCount === 5) starsEarned = 3;
    else if (correctCount === 4) starsEarned = 2;
    else if (correctCount >= 3) starsEarned = 1;
    const levelKey = `c${chapter}_l${level}`;
    saveProgress({
      quizStars: {
        ...progress.quizStars,
        [levelKey]: Math.max(progress.quizStars[levelKey] ?? 0, starsEarned),
      },
    });
  };

  // Tính số sao đạt được
  const starsEarned = correctCount === 5 ? 3 : correctCount === 4 ? 2 : correctCount >= 3 ? 1 : 0;
  const isPassed = starsEarned >= 1;

  const handleReplay = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsFinished(false);
    setTimeLeft(30);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLevelSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát Màn</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="font-black text-xs sm:text-sm text-slate-200">
              {levelData.title}
            </h1>
            <span className="text-[10px] text-amber-400/90 font-mono">
              Chương {chapter} • Rút 5 câu ngẫu nhiên
            </span>
          </div>
        </div>

        {!isFinished && (
          <div className="flex items-center gap-3">
            {/* Đồng hồ bấm giờ */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono font-black ${
                timeLeft <= 5
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>

            {/* Tiến trình 5 câu */}
            <div className="text-xs font-black text-amber-400 font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              Câu {currentIndex + 1} / {questions.length}
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto no-scrollbar">
        {!isFinished ? (
          <div className="max-w-2xl w-full flex flex-col justify-between h-full max-h-[580px]">
            {/* Question Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl relative">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-900">
                  {currentQ.source}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Điểm hiện tại: {correctCount}/{currentIndex + (isAnswered ? 1 : 0)}
                </span>
              </div>

              <h2 className="font-black text-sm sm:text-base text-slate-100 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              {currentQ.options.map((opt, idx) => {
                const isCorrect = idx === currentQ.answer;
                const isSelected = selectedOption === idx;

                let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-200';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50 shadow-lg';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50';
                  } else {
                    btnStyle = 'bg-slate-900/40 border-slate-800 opacity-40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border-2 text-left text-xs font-bold transition-all flex items-start gap-3 cursor-pointer select-none ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono flex items-center justify-center flex-shrink-0 text-xs font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug pt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Actions */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 animate-in fade-in duration-150 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  {selectedOption === currentQ.answer ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-100 block mb-1">
                      {selectedOption === currentQ.answer ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}
                    </span>
                    <span>{currentQ.explain}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onOpenKnowledgeSource(currentQ.source)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem lại kiến thức liên quan</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-md"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ANGRY BIRDS RESULT SCREEN */
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Trophy / Stars Header */}
            <div className="flex items-center justify-center gap-3 my-4">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-12 h-12 transition-all duration-300 ${
                    starsEarned >= starIdx
                      ? 'fill-amber-400 text-amber-400 scale-125 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                      : 'text-slate-800'
                  }`}
                />
              ))}
            </div>

            <h2 className="font-black text-xl sm:text-2xl text-slate-100 mt-2">
              {isPassed ? 'CHIẾN THẮNG QUA MÀN!' : 'CHƯA ĐẠT CHUẨN!'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-4">
              {starsEarned === 3 && 'Hoàn hảo tuyệt đối! Bạn đã trả lời đúng cả 5/5 câu!'}
              {starsEarned === 2 && 'Rất tốt! Đúng 4/5 câu. Đã nắm vững kiến thức!'}
              {starsEarned === 1 && 'Đạt chuẩn qua màn! Đúng 3/5 câu.'}
              {starsEarned === 0 && 'Cần trả lời đúng ít nhất 3/5 câu để qua màn. Hãy thử lại nhé!'}
            </p>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono mb-6 flex justify-around">
              <div>
                <span className="text-slate-500 block text-[10px]">ĐÚNG</span>
                <span className="font-black text-base text-emerald-400">{correctCount} / 5</span>
              </div>
              <div className="w-px h-8 bg-slate-800 my-auto" />
              <div>
                <span className="text-slate-500 block text-[10px]">ĐÁNH GIÁ</span>
                <span className="font-black text-base text-amber-400">{starsEarned} Sao</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {isPassed && onNextLevel && level < 10 && (
                <button
                  onClick={onNextLevel}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Màn Tiếp Theo (Màn {level + 1})</span>
                </button>
              )}

              <button
                onClick={handleReplay}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-700 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bắn Lại Màn Này (Replay)</span>
              </button>

              <button
                onClick={onBackToLevelSelect}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 font-bold text-xs transition-colors cursor-pointer"
              >
                Về Bản Đồ Màn Chơi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
