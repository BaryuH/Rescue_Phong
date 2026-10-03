import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Award, Scale, Heart, Coins, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { EventBus } from '../game/EventBus';
import { useProgress } from '../systems/save';
import { sound } from '../systems/audio';
import { RPGDialogueModal, RPGDialogueData } from './RPGDialogueModal';
import { FinalCodexModal } from './FinalCodexModal';
import chuong1Data from '../data/scenarios/chuong-1.json';
import chuong2Data from '../data/scenarios/chuong-2.json';

interface Props {
  onBackToCity: () => void;
  onOpenKnowledgeSource?: (sourceId: string) => void;
}

export const BattleRPGOverlay: React.FC<Props> = ({ onBackToCity, onOpenKnowledgeSource }) => {
  const [progress] = useProgress();
  const [activeDialogue, setActiveDialogue] = useState<RPGDialogueData | null>(null);
  const [activeScenario, setActiveScenario] = useState<any | null>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Tất cả 10 kịch bản từ 2 chương
  const allScenarios = [...chuong1Data, ...chuong2Data];

  // Lắng nghe sự kiện đối thoại từ Phaser OverworldScene
  useEffect(() => {
    const handleOpenDialogue = (data: RPGDialogueData) => {
      sound.playBattleStart();
      setActiveDialogue(data);
      setActiveScenario(data);
    };

    EventBus.on('open-rpg-dialogue', handleOpenDialogue);

    return () => {
      EventBus.removeListener('open-rpg-dialogue', handleOpenDialogue);
    };
  }, []);

  // Đếm số kịch bản đã giải quyết
  const clearedCount = Math.max(
    Object.keys(progress.rpgDecisions || {}).length,
    allScenarios.filter((s) => progress.badges.includes(s.id)).length
  );
  const isAllCleared = clearedCount >= 10;

  // 3 Chỉ số vĩ mô động
  const institutionScore = Math.min(Math.round(50 + clearedCount * 4.8), 98);
  const welfareScore = Math.min(Math.round(45 + clearedCount * 5.1), 96);
  const budgetGain = Math.min(Math.round(100 + clearedCount * 32), 420);

  const handleClearScenario = (scenarioId: string) => {
    EventBus.emit('scenario-cleared', scenarioId);
  };

  const handleBackToCity = () => {
    sound.playClick();
    setActiveDialogue(null);
    setActiveScenario(null);
    setShowCodex(false);
    setShowGuide(false);
    EventBus.emit('rpg-dialogue-closed');
    onBackToCity();
  };

  return (
    <>
      {/* Top HUD: Macro Indicators & Action Bar */}
      <div className="absolute top-2 left-2 right-2 z-30 flex flex-col md:flex-row items-center justify-between gap-2 pointer-events-none">
        {/* Nút Quay lại & Tên Phân Khu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleBackToCity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Về Thành Phố</span>
          </button>

          <div className="px-3 py-1 rounded-xl bg-slate-950/85 border border-amber-500/50 text-slate-100 flex items-center gap-2 shadow-lg">
            <span className="text-amber-400 text-xs font-black">⚔️ ĐẤU TRƯỜNG THỂ CHẾ RPG</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
              ({clearedCount}/10 Đã Phán Quyết)
            </span>
          </div>
        </div>

        {/* 3 Thanh Chỉ Số Vĩ Mô Quốc Gia */}
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-xl pointer-events-auto">
          {/* Thể Chế */}
          <div className="flex items-center gap-1.5" title="Điểm Thể Chế Kinh Tế Thị Trường Định Hướng XHCN">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <div className="w-16 sm:w-20 bg-slate-800 h-2 rounded-full overflow-hidden border border-emerald-500/30">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${institutionScore}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-300">{institutionScore}%</span>
          </div>

          <div className="w-[1px] h-3.5 bg-slate-800" />

          {/* An Sinh */}
          <div className="flex items-center gap-1.5" title="Chỉ Số An Sinh Xã Hội & Niềm Tin Nhân Dân">
            <Heart className="w-3.5 h-3.5 text-teal-400" />
            <div className="w-16 sm:w-20 bg-slate-800 h-2 rounded-full overflow-hidden border border-teal-500/30">
              <div
                className="bg-teal-400 h-full transition-all duration-500"
                style={{ width: `${welfareScore}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-300">{welfareScore}%</span>
          </div>

          <div className="w-[1px] h-3.5 bg-slate-800" />

          {/* Ngân Sách */}
          <div className="flex items-center gap-1.5" title="Ngân Sách Quốc Gia & Quỹ Phát Triển Thu Được Từ Thuế Số">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-black text-amber-300">+{budgetGain} Tỷ</span>
          </div>
        </div>

        {/* Nút Xem Final Codex & Hướng Dẫn */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              setShowCodex(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 ${
              isAllCleared
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 animate-pulse hover:brightness-110'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/60 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sổ Phán Quyết</span>
            {isAllCleared && <span className="text-[9px] bg-slate-950 text-amber-300 px-1 rounded">10/10</span>}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowGuide(!showGuide);
            }}
            title="Hướng dẫn điều khiển RPG"
            className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* District Navigator Bar: Phân nhóm 4 phân khu theo từng câu chuyện & chương */}
      <div className="absolute top-14 left-2 right-2 z-30 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/90 backdrop-blur-sm border border-slate-800/90 p-1 sm:p-1.5 rounded-2xl shadow-2xl pointer-events-auto overflow-x-auto max-w-full no-scrollbar">
          {/* Nhà Hát Nghệ Thuật */}
          <button
            onClick={() => {
              sound.playClick();
              EventBus.emit('teleport-district', { district: 1 });
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/50 hover:border-purple-400 text-[11px] font-bold text-purple-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>🎵</span>
            <span>Nhà Hát Nghệ Thuật</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-mono">
              {[
                'scenario_jack_j97',
                'scenario_icm_entertainment',
                'scenario_nathan_lee_copyright',
              ].filter((id) => progress.badges.includes(id)).length}
              /3
            </span>
          </button>

          {/* Xưởng Xe & Rạp Phim */}
          <button
            onClick={() => {
              sound.playClick();
              EventBus.emit('teleport-district', { district: 2 });
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-emerald-500/50 hover:border-emerald-400 text-[11px] font-bold text-emerald-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>🚗</span>
            <span>Xưởng Xe & Rạp Phim</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
              {['scenario_vinfast_pham_nhat_vuong', 'scenario_tran_thanh_cinema'].filter((id) =>
                progress.badges.includes(id)
              ).length}
              /2
            </span>
          </button>

          {/* Studio Livestream */}
          <button
            onClick={() => {
              sound.playClick();
              EventBus.emit('teleport-district', { district: 3 });
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-orange-950/60 border border-orange-500/50 hover:border-orange-400 text-[11px] font-bold text-orange-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>🔥</span>
            <span>Studio Livestream</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-orange-950 text-orange-300 font-mono">
              {['scenario_ceo_phuong_hang', 'scenario_hoai_linh_charity'].filter((id) =>
                progress.badges.includes(id)
              ).length}
              /2
            </span>
          </button>

          {/* Tòa Án & Trại Tạm Giam */}
          <button
            onClick={() => {
              sound.playClick();
              EventBus.emit('teleport-district', { district: 4 });
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-blue-950/60 border border-blue-500/50 hover:border-blue-400 text-[11px] font-bold text-blue-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>⚖️</span>
            <span>Tòa Án & Trại Tạm Giam</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950 text-blue-300 font-mono">
              {[
                'scenario_quang_linh_kera',
                'scenario_thuy_tien_kera',
                'scenario_cuc_thue_so_boss',
              ].filter((id) => progress.badges.includes(id)).length}
              /3
            </span>
          </button>
        </div>
      </div>


      {/* Pop-up Hướng dẫn chi tiết trên Mobile */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-black text-sm text-amber-300 uppercase flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Hướng Dẫn Chơi RPG Thể Chế
            </h3>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                1. <b>Di chuyển</b>: Dùng cụm phím <b>W - A - S - D</b>, các phím mũi tên trên bàn phím, hoặc <b>D-Pad ảo</b> trên màn hình cảm ứng để chạy dọc con phố.
              </p>
              <p>
                2. <b>Bắt chuyện với 10 NPC</b>: Khi chạy lại gần NPC (Jack J97, Mẹ nuôi ICM, Phạm Nhật Vượng, Trấn Thành, Phương Hằng, Hoài Linh, Võ Hà Linh, Cục Trưởng Thuế...), nhấn <b>SPACE</b> hoặc <b>nhấp chuột vào NPC</b>.
              </p>
              <p>
                3. <b>Phán quyết thể chế</b>: Lắng nghe lời trần tình của họ và đưa ra phán quyết kinh tế thị trường định hướng XHCN chuẩn mực theo giáo trình Mác - Lênin (Trang 187 - 214).
              </p>
              <p>
                4. <b>Mở khóa The Final Codex</b>: Hoàn thành cả 10 NPC để nhận danh hiệu <b>Hài Hòa Kinh Tế - Xã Hội Chủ Nghĩa Hoàn Hảo</b>!
              </p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
            >
              Đã Hiểu, Tiếp Tục Chơi
            </button>
          </div>
        </div>
      )}

      {/* Modal Đối Thoại RPG Nhập Vai */}
      {activeDialogue && activeScenario && (
        <RPGDialogueModal
          dialogueData={activeDialogue}
          scenario={activeScenario}
          onClose={() => {
            setActiveDialogue(null);
            setActiveScenario(null);
            EventBus.emit('rpg-dialogue-closed');
          }}
          onClearScenario={handleClearScenario}
        />
      )}

      {/* Modal Bảng Tổng Kết The Final Codex */}
      <FinalCodexModal isOpen={showCodex} onClose={() => setShowCodex(false)} />
    </>
  );
};
