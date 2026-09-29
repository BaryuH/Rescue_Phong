import React, { useState } from 'react';
import { ArrowLeft, Shield, Zap, Flame, Award, Heart, HelpCircle } from 'lucide-react';
import { transitionTo } from '../systems/transition';
import { useProgress } from '../systems/save';
import scenariosData from '../data/scenarios/chuong-1.json';

interface Props {
  onBackToCity: () => void;
}

export const BattleView: React.FC<Props> = ({ onBackToCity }) => {
  const [progress, saveProgress] = useProgress();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [danger, setDanger] = useState(100);
  const [calm, setCalm] = useState(100);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const scenario = scenariosData[selectedScenarioIndex] || scenariosData[0];
  const turnData = scenario.turns[currentTurn] || scenario.turns[0];

  const handleChooseOption = (opt: typeof turnData.options[0]) => {
    const nextDanger = Math.max(0, danger + opt.danger);
    const nextCalm = Math.max(0, Math.min(100, calm + (opt.calm ?? 0)));
    setDanger(nextDanger);
    setCalm(nextCalm);
    setLastFeedback(opt.explain);

    // Nếu hạ được nguy hiểm về 0 -> Chiến thắng
    if (nextDanger === 0) {
      if (!progress.badges.includes(scenario.id)) {
        saveProgress({
          badges: [...progress.badges, scenario.id],
        });
      }
    }
  };

  const handleResetScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setCurrentTurn(0);
    setDanger(100);
    setCalm(100);
    setLastFeedback(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              transitionTo(onBackToCity, 'Bản Đồ Thành Phố', 'default');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-700 text-rose-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Thành Phố</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="font-black text-sm sm:text-base tracking-wide text-rose-400">
              ĐẤU TRƯỜNG THỂ CHẾ (Pokemon Style Battle)
            </h1>
          </div>
        </div>

        {/* Badges count */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 font-black text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{progress.badges.length} / 3 Huy Hiệu</span>
          <span className="text-[10px] text-rose-200/70 hidden sm:inline">
            (Cần 3 huy hiệu giải cứu Phong)
          </span>
        </div>
      </div>

      {/* Main Battle Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Scenario List (Left / Drawer) */}
        <div className="w-full lg:w-72 bg-slate-900/60 border-r border-slate-800/80 p-3 overflow-y-auto no-scrollbar flex-shrink-0">
          <span className="text-[11px] font-black uppercase text-slate-400 block mb-2 px-1">
            Chọn Đối Thủ (Khu 1)
          </span>
          <div className="space-y-2">
            {scenariosData.map((sc, idx) => {
              const isCleared = progress.badges.includes(sc.id);
              const isSelected = idx === selectedScenarioIndex;

              return (
                <button
                  key={sc.id}
                  onClick={() => handleResetScenario(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-500 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-200">{sc.npcName}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{sc.title}</div>
                  </div>
                  {isCleared && <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Battle Arena Area */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-y-auto no-scrollbar">
          {/* NPC Status Block (Opponent) */}
          <div className="flex items-start justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 max-w-xl self-end w-full shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-amber-300">{scenario.npcName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {scenario.title}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1">{turnData.prompt}</div>
            </div>

            {/* Danger Meter */}
            <div className="flex flex-col items-end flex-shrink-0 ml-4">
              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Nguy Hiểm: {danger}%
              </span>
              <div className="w-28 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700 mt-1">
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${danger}%` }}
                />
              </div>
            </div>
          </div>

          {/* Victory / Defeat Overlay */}
          {danger === 0 ? (
            <div className="my-6 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-center animate-in zoom-in-95 duration-200">
              <h3 className="font-black text-lg text-emerald-300 flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                CHIẾN THẮNG! NGUY HIỂM ĐÃ ĐƯỢC GIẢI QUYẾT!
              </h3>
              <p className="text-xs text-emerald-200 mt-1">
                Bạn đã nhận được 1 Huy hiệu Thể chế Khu 1!
              </p>
              <button
                onClick={() => handleResetScenario(selectedScenarioIndex)}
                className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                Chơi Lại Trận Này
              </button>
            </div>
          ) : calm === 0 ? (
            <div className="my-6 p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-center animate-in zoom-in-95 duration-200">
              <h3 className="font-black text-lg text-rose-300">
                THẤT BẠI! BẠN ĐÃ MẤT HẾT ĐIỂM BÌNH TĨNH!
              </h3>
              <p className="text-xs text-rose-200 mt-1">
                Tình huống leo thang quá mức. Hãy thử lại với quyết sách thể chế chuẩn mực hơn!
              </p>
              <button
                onClick={() => handleResetScenario(selectedScenarioIndex)}
                className="mt-3 px-4 py-1.5 rounded-xl bg-rose-500 text-slate-950 font-bold text-xs hover:bg-rose-400 cursor-pointer"
              >
                Thử Lại Trận Này
              </button>
            </div>
          ) : null}

          {/* Player Composure Status & Move Board */}
          <div className="max-w-2xl w-full self-start mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                Độ Bình Tĩnh Của Bạn: {calm}%
              </span>
              {lastFeedback && (
                <span className="text-[11px] text-amber-300 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  {lastFeedback}
                </span>
              )}
            </div>

            {/* 4 Action Moves (Pokemon Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {turnData.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  disabled={danger === 0 || calm === 0}
                  onClick={() => handleChooseOption(opt)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between group ${
                    danger === 0 || calm === 0
                      ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800'
                      : 'bg-slate-900 hover:bg-slate-800/80 border-slate-700 hover:border-amber-500/80 cursor-pointer shadow-md'
                  }`}
                >
                  <span className="text-slate-100 group-hover:text-amber-300 transition-colors">
                    {opt.text}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span className="text-rose-400 font-mono">
                      Nguy hiểm: {opt.danger > 0 ? `+${opt.danger}` : opt.danger}%
                    </span>
                    {opt.calm !== undefined && (
                      <span className="text-emerald-400 font-mono">
                        Bình tĩnh: {opt.calm > 0 ? `+${opt.calm}` : opt.calm}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
