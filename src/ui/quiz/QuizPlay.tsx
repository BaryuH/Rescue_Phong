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

  const [replayCount, setReplayCount] = useState(0);

  // Rút ngẫu nhiên đúng 5 câu hỏi từ ngân hàng câu hỏi
  const questions: QuestionItem[] = useMemo(() => {
    const pool = [...levelData.questions];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }, [levelData, replayCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Reset toàn bộ trạng thái khi đổi màn hoặc chương
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsFinished(false);
    setTimeLeft(30);
  }, [chapter, level]);

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
    setReplayCount((c) => c + 1);
  };

  return (
    <div className="w-full h-full flex flex-col bg-dot-pattern text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Bar The Growth G3 Style */}
      <div className="h-14 bg-white border-b-2.5 border-slate-900 px-4 flex items-center justify-between flex-shrink-0 z-20 shadow-comic-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToLevelSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-300 hover:bg-amber-200 active:scale-95 text-xs font-comic font-black transition-all cursor-pointer text-slate-950 shadow-comic-sm btn-comic-press shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Thoát Màn</span>
          </button>
          <div className="h-5 w-0.5 bg-slate-300 hidden sm:block shrink-0" />
          <div className="min-w-0">
            <h1 className="font-comic font-black text-xs sm:text-sm text-slate-950 uppercase tracking-wide truncate">
              {levelData.title}
            </h1>
            <span className="text-[10px] text-purple-700 font-comic font-bold block truncate">
              Mục {chapter === 1 ? 'II: Thể Chế' : 'III: Lợi Ích'} • Rút 5 câu ngẫu nhiên
            </span>
          </div>
        </div>

        {!isFinished && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Đồng hồ bấm giờ */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 border-2 rounded-xl text-xs font-comic font-black shadow-comic-sm ${
                timeLeft <= 5
                  ? 'bg-rose-200 border-slate-900 text-rose-950 animate-pulse'
                  : 'bg-purple-200 border-slate-900 text-purple-950'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-purple-900" />
              <span>TIME: {timeLeft}s</span>
            </div>

            {/* Tiến trình 5 câu */}
            <div className="text-xs font-comic font-black text-amber-950 px-3 py-1 bg-amber-200 border-2 border-slate-900 rounded-xl shadow-comic-sm">
              Câu {currentIndex + 1} / {questions.length}
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto no-scrollbar">
        {!isFinished ? (
          <div className="max-w-2xl w-full flex flex-col justify-between h-full max-h-[580px]">
            {/* Question Dialogue Frame (The Growth G3 Style) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border-3 border-slate-900 shadow-comic relative">
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-900/15">
                <span className="text-[10px] font-comic font-black px-2.5 py-0.5 bg-indigo-200 text-indigo-950 border border-slate-900 rounded-lg shadow-comic-sm">
                  {currentQ.source}
                </span>
                <span className="text-xs font-comic font-black text-slate-600">
                  Điểm: {correctCount}/{currentIndex + (isAnswered ? 1 : 0)}
                </span>
              </div>

              <h2 className="font-comic font-black text-base sm:text-lg text-slate-950 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Choices Grid (Comic Push-buttons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
              {currentQ.options.map((opt, idx) => {
                const isCorrect = idx === currentQ.answer;
                const isSelected = selectedOption === idx;

                let btnStyle = 'bg-white hover:bg-purple-50 text-slate-900 border-slate-900 shadow-comic-sm';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-300 text-emerald-950 border-slate-900 shadow-comic-sm ring-2 ring-emerald-500 font-black';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-300 text-rose-950 border-slate-900 shadow-comic-sm ring-2 ring-rose-500 font-black';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-300 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-start gap-3 cursor-pointer select-none btn-comic-press ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-slate-950 border border-slate-900 font-comic flex items-center justify-center flex-shrink-0 text-xs font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug pt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Actions (Battle Log Style) */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-purple-50 border-2 border-slate-900 shadow-comic-sm animate-in fade-in duration-150 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  {selectedOption === currentQ.answer ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs text-slate-900 leading-relaxed font-sans">
                    <span className="font-comic font-black text-sm block mb-1 uppercase tracking-wide">
                      {selectedOption === currentQ.answer ? (
                        <span className="text-emerald-700">🎉 Chính xác!</span>
                      ) : (
                        <span className="text-rose-700">❌ Chưa chính xác!</span>
                      )}
                    </span>
                    <span className="font-medium text-slate-800">{currentQ.explain}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900/15">
                  <button
                    onClick={() => onOpenKnowledgeSource(currentQ.source)}
                    className="flex items-center gap-1.5 text-xs font-comic font-black text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem lại kiến thức liên quan</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-comic font-black text-xs transition-colors cursor-pointer border-2 border-slate-900 shadow-comic-sm btn-comic-press"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo ►' : 'Xem Kết Quả ►'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* THE GROWTH G3 COMIC RESULT SCREEN */
          <div className="max-w-md w-full bg-white border-3 border-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-comic-lg animate-in zoom-in-95 duration-200">
            {/* Stars Header */}
            <div className="flex items-center justify-center gap-3 my-4">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-12 h-12 transition-all duration-300 ${
                    starsEarned >= starIdx
                      ? 'fill-amber-400 text-amber-500 scale-125 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            <h2 className="font-comic font-black text-xl sm:text-2xl text-slate-950 mt-2 uppercase tracking-wide">
              {isPassed ? 'CHIẾN THẮNG QUA MÀN!' : 'CHƯA ĐẠT CHUẨN!'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 mt-1 mb-4 font-bold">
              {starsEarned === 3 && 'Hoàn hảo tuyệt đối! Bạn đã trả lời đúng cả 5/5 câu!'}
              {starsEarned === 2 && 'Rất tốt! Đúng 4/5 câu. Đã nắm vững kiến thức!'}
              {starsEarned === 1 && 'Đạt chuẩn qua màn! Đúng 3/5 câu.'}
              {starsEarned === 0 && 'Cần trả lời đúng ít nhất 3/5 câu để qua màn. Hãy thử lại nhé!'}
            </p>

            <div className="p-3 bg-amber-50 border-2 border-slate-900 rounded-2xl text-xs font-comic mb-6 flex justify-around shadow-comic-sm">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">ĐÚNG</span>
                <span className="font-black text-base text-emerald-600">{correctCount} / 5</span>
              </div>
              <div className="w-0.5 h-8 bg-slate-300 my-auto" />
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">ĐÁNH GIÁ</span>
                <span className="font-black text-base text-amber-600">{starsEarned} Sao</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {isPassed && onNextLevel && (level < 10 || chapter === 1) && (
                <button
                  onClick={onNextLevel}
                  className="w-full py-3 rounded-xl bg-purple-300 hover:bg-purple-200 text-slate-950 font-comic font-black text-xs transition-colors cursor-pointer border-2 border-slate-900 shadow-comic-sm btn-comic-press flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-900" />
                  <span>
                    {level < 10
                      ? `Màn Tiếp Theo (Màn ${level + 1}) ►`
                      : 'Sang Mục III: Quan Hệ Lợi Ích (Màn 1) ►'}
                  </span>
                </button>
              )}

              <button
                onClick={handleReplay}
                className="w-full py-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-comic font-black text-xs transition-colors cursor-pointer border-2 border-slate-900 shadow-comic-sm btn-comic-press flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bắn Lại Màn Này (Replay) ↻</span>
              </button>

              <button
                onClick={onBackToLevelSelect}
                className="w-full py-2.5 bg-transparent hover:bg-slate-100 text-slate-600 font-comic font-bold text-xs transition-colors cursor-pointer"
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
