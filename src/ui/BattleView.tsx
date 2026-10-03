import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Flame, Award, Heart, HelpCircle, Swords, Clock, Lightbulb, RotateCcw, BookOpen, Sparkles, MapPin, CheckCircle, Lock } from 'lucide-react';
import { transitionTo } from '../systems/transition';
import { useProgress } from '../systems/save';
import { sound } from '../systems/audio';
import { DifficultyLevel, MedalType, REQUIRED_BADGES_FOR_KHU_2, isKhu2Unlocked } from '../systems/progress';
import { VirtualDPad } from './VirtualDPad';
import { NPCDialogue, DialoguePayload } from './NPCDialogue';
import { EventBus } from '../game/EventBus';
import scenariosDataCh1 from '../data/scenarios/chuong-1.json';
import scenariosDataCh2 from '../data/scenarios/chuong-2.json';
import difficultyConfig from '../data/difficulty.json';

interface Props {
  onBackToCity: () => void;
  onOpenKnowledgeSource?: (sourceId: string) => void;
  initialDistrict?: 1 | 2;
  initialScenarioId?: string | null;
}

export const BattleView: React.FC<Props> = ({
  onBackToCity,
  onOpenKnowledgeSource,
  initialDistrict = 1,
  initialScenarioId = null,
}) => {
  const [progress, saveProgress] = useProgress();
  const [filter, setFilter] = useState<'all' | 'ch1' | 'ch2'>('all');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(initialScenarioId);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('cuuhovien');
  const [dialogue, setDialogue] = useState<DialoguePayload | null>(null);

  // Trạng thái trận đấu
  const [currentTurn, setCurrentTurn] = useState(0);
  const [danger, setDanger] = useState(100);
  const [calm, setCalm] = useState(100);
  const [lastExplain, setLastExplain] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<'super' | 'ok' | 'backfire' | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [hintsLeft, setHintsLeft] = useState(1);
  const [turnTimer, setTurnTimer] = useState(30);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const currentScenariosList =
    filter === 'ch1'
      ? scenariosDataCh1
      : filter === 'ch2'
      ? scenariosDataCh2
      : [...scenariosDataCh1, ...scenariosDataCh2];

  useEffect(() => {
    const handleDialogue = (data: DialoguePayload) => {
      setDialogue(data);
    };

    EventBus.on('open-npc-dialogue', handleDialogue);
    return () => {
      EventBus.removeListener('open-npc-dialogue', handleDialogue);
    };
  }, []);

  const currentScenario =
    currentScenariosList.find((s) => s.id === activeScenarioId) || currentScenariosList[0];
  const turnData = currentScenario.turns[currentTurn] || currentScenario.turns[0];
  const diffSettings = difficultyConfig[selectedDifficulty];

  const startBattle = (scenarioId: string, diff: DifficultyLevel = 'cuuhovien') => {
    setActiveScenarioId(scenarioId);
    setSelectedDifficulty(diff);
    setCurrentTurn(0);
    setDanger(currentScenario.danger || 100);
    setCalm(100);
    setLastExplain(null);
    setLastResult(null);
    setEliminatedOptions([]);
    setHintsLeft(difficultyConfig[diff].hints);
    setTurnTimer(difficultyConfig[diff].timer);
    setIsBattleOver(false);
    setIsWon(false);
    setDialogue(null);

    sound.playBattleStart();
  };

  useEffect(() => {
    if (!activeScenarioId || isBattleOver || diffSettings.timer === 0) return;

    if (turnTimer <= 0) {
      sound.playWrong();
      const mult = diffSettings.wrongMult;
      setCalm((c) => Math.max(0, c - Math.round(25 * mult)));
      setDanger((d) => Math.min(100, d + Math.round(20 * mult)));
      setLastExplain('Hết thời gian suy nghĩ! Bạn đã lúng túng làm tình huống trở nên căng thẳng hơn.');
      setLastResult('backfire');
      setTurnTimer(diffSettings.timer);
      return;
    }

    const t = setInterval(() => {
      setTurnTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [activeScenarioId, isBattleOver, turnTimer, diffSettings]);

  const availableOptions = turnData.options.filter((opt) => {
    if (selectedDifficulty === 'tapsu') {
      return opt.minLevel !== 'cuuhovien' && opt.minLevel !== 'chuyengia';
    }
    return true;
  });

  const handleChooseOption = (optIndex: number) => {
    if (isBattleOver) return;

    const opt = availableOptions[optIndex];
    const mult = opt.result === 'backfire' ? diffSettings.wrongMult : 1;

    const dDelta = opt.danger;
    const cDelta = (opt.calm ?? 0) * mult;

    const nextDanger = Math.max(0, danger + dDelta);
    const nextCalm = Math.max(0, Math.min(100, calm + cDelta));

    setDanger(nextDanger);
    setCalm(nextCalm);
    setLastExplain(opt.explain);
    setLastResult(opt.result as 'super' | 'ok' | 'backfire');
    setTurnTimer(diffSettings.timer);

    if (opt.result === 'super') {
      sound.playHit();
    } else if (opt.result === 'backfire') {
      sound.playWrong();
    } else {
      sound.playClick();
    }

    if (nextDanger === 0) {
      handleVictory();
    } else if (nextCalm === 0) {
      setIsBattleOver(true);
      setIsWon(false);
      sound.playWrong();
    } else if (currentTurn < currentScenario.turns.length - 1 && opt.result === 'super') {
      setTimeout(() => {
        setCurrentTurn((t) => t + 1);
        setEliminatedOptions([]);
      }, 1000);
    }
  };

  const handleVictory = () => {
    setIsBattleOver(true);
    setIsWon(true);
    sound.playVictory();

    const medal: MedalType =
      selectedDifficulty === 'chuyengia'
        ? 'gold'
        : selectedDifficulty === 'cuuhovien'
        ? 'silver'
        : 'bronze';

    const newRecord = {
      scenarioId: currentScenario.id,
      bestDifficulty: selectedDifficulty,
      medal,
      clearedAt: Date.now(),
    };

    const newBadges = progress.badges.includes(currentScenario.id)
      ? progress.badges
      : [...progress.badges, currentScenario.id];

    saveProgress({
      scenarioRecords: {
        ...progress.scenarioRecords,
        [currentScenario.id]: newRecord,
      },
      badges: newBadges,
    });
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0) return;

    const wrongIndexes = availableOptions
      .map((opt, idx) => ({ opt, idx }))
      .filter(({ opt, idx }) => opt.result === 'backfire' && !eliminatedOptions.includes(idx))
      .map(({ idx }) => idx);

    if (wrongIndexes.length > 0) {
      const eliminateIdx = wrongIndexes[0];
      setEliminatedOptions([...eliminatedOptions, eliminateIdx]);
      setHintsLeft((h) => h - 1);
      sound.playClick();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Top Header */}
      <div className="h-14 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeScenarioId) {
                setActiveScenarioId(null);
              } else {
                onBackToCity();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-rose-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{activeScenarioId ? 'Rời Trận Đấu' : 'Về Bản Đồ'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <div>
              <h1 className="font-black text-xs sm:text-sm text-slate-100 uppercase">
                {activeScenarioId ? currentScenario.title : 'ĐẤU TRƯỜNG THỂ CHẾ & SHOWBIZ DRAMA'}
              </h1>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                {activeScenarioId
                  ? `Đấu với: ${currentScenario.npcName}`
                  : '10 Đại Án Thể Chế & Showbiz Drama • Cả Hồi 1 & Hồi 2'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Badges Count */}
        <div className="flex items-center gap-2">
          {!activeScenarioId && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất Cả (10)
              </button>

              <button
                onClick={() => setFilter('ch1')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'ch1'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hồi 1: Giải Trí & Công Nghệ
              </button>

              <button
                onClick={() => setFilter('ch2')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'ch2'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hồi 2: Sao Kê & Thuế Số
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 font-black text-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{progress.badges.length}/10 Huy Hiệu</span>
          </div>
        </div>
      </div>

      {/* MODE 1: OVERWORLD STREET */}
      {!activeScenarioId ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Danh sách các tình huống của khu phố */}
          <div className="w-full md:w-80 bg-slate-900/70 border-r border-slate-800 p-4 overflow-y-auto no-scrollbar flex-shrink-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
              {filter === 'ch1'
                ? 'Hồi 1: Giải Trí, Công Nghệ & Bản Quyền (5)'
                : filter === 'ch2'
                ? 'Hồi 2: Sao Kê Từ Thiện, Sàn Số & Thuế (5)'
                : 'Tất Cả 10 Tình Huống Showbiz & Thể Chế'}
            </span>
            <div className="space-y-2.5">
              {currentScenariosList.map((sc) => {
                const record = progress.scenarioRecords[sc.id];
                const isCleared = !!record;

                return (
                  <div
                    key={sc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-md ${
                      sc.id === 'scenario_cuc_thue_so_boss'
                        ? 'bg-purple-950/40 border-purple-500'
                        : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-black text-xs text-amber-400">{sc.npcName}</span>
                        {isCleared && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {record.medal.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-slate-200">{sc.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                        {sc.turns[0].prompt}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {Array.isArray(sc.source) ? sc.source[0] : sc.source}
                      </span>
                      <button
                        onClick={() => startBattle(sc.id, 'cuuhovien')}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95 ${
                          sc.id === 'scenario_cuc_thue_so_boss'
                            ? 'bg-gradient-to-r from-purple-500 to-amber-400 text-slate-950 hover:brightness-110'
                            : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 text-slate-950'
                        }`}
                      >
                        {sc.id === 'scenario_cuc_thue_so_boss' ? 'Trùm Cuối ➔' : 'Giao Đấu ➔'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phố đi bộ tương tác */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            <div className="max-w-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-2xl border-2 bg-rose-950/60 border-rose-500 text-rose-400">
                ⚔️
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                ĐẤU TRƯỜNG THỂ CHẾ & SHOWBIZ DRAMA
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Giải quyết 10 đại án thể chế kịch tính: từ hợp đồng độc quyền Jack vs ICM, xe điện Net Zero của Phạm Nhật Vượng, phòng vé Trấn Thành đến cuộc chiến sao kê Phương Hằng vs Hoài Linh, đạp giá Võ Hà Linh và truy thu thuế số!
              </p>
            </div>

            <VirtualDPad />

            <NPCDialogue
              dialogue={dialogue}
              onClose={() => setDialogue(null)}
              onStartBattle={(scId) => startBattle(scId)}
            />
          </div>
        </div>
      ) : (
        /* MODE 2: BATTLE ARENA */
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-y-auto no-scrollbar">
          {/* Top Battle Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 max-w-4xl w-full mx-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold mr-1">Độ khó:</span>
              {(['tapsu', 'cuuhovien', 'chuyengia'] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  disabled={!isBattleOver && (danger < 100 || calm < 100)}
                  onClick={() => startBattle(activeScenarioId, d)}
                  className={`px-2.5 py-1 rounded-lg font-black transition-all text-xs cursor-pointer ${
                    selectedDifficulty === d
                      ? 'bg-rose-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d === 'tapsu' && 'Tập Sự (Dễ)'}
                  {d === 'cuuhovien' && 'Cứu Hộ Viên (Vừa)'}
                  {d === 'chuyengia' && 'Chuyên Gia (Khó)'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {diffSettings.timer > 0 && !isBattleOver && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono text-xs font-black ${
                    turnTimer <= 5
                      ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{turnTimer}s</span>
                </div>
              )}

              {diffSettings.hints > 0 && !isBattleOver && (
                <button
                  disabled={hintsLeft <= 0}
                  onClick={handleUseHint}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    hintsLeft > 0
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 hover:bg-amber-900'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Gợi ý ({hintsLeft})</span>
                </button>
              )}
            </div>
          </div>

          {/* NPC Status Block (Opponent) */}
          <div className="my-auto max-w-4xl w-full mx-auto space-y-6">
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-inner">
                  {currentScenario.id.includes('phong') ? '🌟' : '⚔️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-100">{currentScenario.npcName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Giai đoạn {currentTurn + 1} / {currentScenario.turns.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-lg">
                    "{turnData.prompt}"
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-48 flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-rose-500" /> Nguy Hiểm: {danger}%
                </span>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mt-1.5">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
                    style={{ width: `${danger}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Victory / Defeat Modal */}
            {isBattleOver && (
              <div
                className={`p-6 rounded-3xl border-2 text-center shadow-2xl animate-in zoom-in-95 duration-200 ${
                  isWon
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                <div className="text-3xl mb-2">{isWon ? (currentScenario.id === 'scenario_cuc_thue_so_boss' ? '🎉' : '🏆') : '💀'}</div>
                <h3 className="font-black text-lg sm:text-xl">
                  {isWon
                    ? currentScenario.id === 'scenario_cuc_thue_so_boss'
                      ? 'XUẤT SẮC! BẠN ĐÃ ĐÁNH BẠI TRÙM CUỐI THỂ CHẾ!'
                      : 'CHIẾN THẮNG TUYỆT ĐỐI!'
                    : 'BẠN ĐÃ THẤT BẠI!'}
                </h3>
                <p className="text-xs sm:text-sm mt-1 max-w-md mx-auto">
                  {isWon
                    ? currentScenario.id === 'scenario_cuc_thue_so_boss'
                      ? 'Bạn đã vận dụng hoàn hảo lý luận Kinh tế chính trị Mác - Lênin, điều hòa mọi mâu thuẫn lợi ích kinh tế và hoàn thành xuất sắc sứ mệnh Trọng tài Thể chế!'
                      : `Bạn đã hóa giải hoàn toàn nguy hiểm và nhận được 1 Huy hiệu (Huy chương ${
                          selectedDifficulty === 'chuyengia' ? 'Vàng' : selectedDifficulty === 'cuuhovien' ? 'Bạc' : 'Đồng'
                        })!`
                    : 'Mức bình tĩnh giảm về 0 do quyết sách chưa phù hợp. Đừng nản lòng, hãy xem lại lý luận và thử lại!'}
                </p>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => startBattle(activeScenarioId, selectedDifficulty)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đấu Lại Trận Này</span>
                  </button>

                  <button
                    onClick={() => setActiveScenarioId(null)}
                    className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
                  >
                    Về Danh Sách Tình Huống
                  </button>
                </div>
              </div>
            )}

            {/* Move cards */}
            {!isBattleOver && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    <span className="font-black text-xs text-slate-200">
                      Độ Bình Tĩnh Của Bạn: {calm}%
                    </span>
                  </div>

                  {lastExplain && (
                    <div className="text-[11px] text-amber-300 flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 max-w-md">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="line-clamp-1">{lastExplain}</span>
                      {onOpenKnowledgeSource && (
                        <button
                          onClick={() => {
                            const src = Array.isArray(currentScenario.source)
                              ? currentScenario.source[0]
                              : currentScenario.source;
                            onOpenKnowledgeSource(src);
                          }}
                          className="text-emerald-400 underline font-bold ml-1 cursor-pointer flex-shrink-0"
                        >
                          Xem lại
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableOptions.map((opt, idx) => {
                    const isEliminated = eliminatedOptions.includes(idx);

                    return (
                      <button
                        key={idx}
                        disabled={isEliminated}
                        onClick={() => handleChooseOption(idx)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between select-none cursor-pointer group ${
                          isEliminated
                            ? 'opacity-30 border-slate-800 bg-slate-950/40 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-700/80 hover:border-amber-500 hover:scale-[1.01] shadow-lg active:scale-95'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono flex items-center justify-center flex-shrink-0 text-xs font-black group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 leading-snug">
                            {opt.text}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-3">
                          <span className="text-rose-400 font-mono font-bold">
                            Nguy hiểm: {opt.danger > 0 ? `+${opt.danger}` : opt.danger}%
                          </span>
                          <span className="text-emerald-400 font-mono font-bold">
                            Bình tĩnh: {opt.calm && opt.calm > 0 ? `+${opt.calm}` : opt.calm || 0}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
