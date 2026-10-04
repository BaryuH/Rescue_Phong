import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle2, RotateCcw, ArrowRight, BookOpen, Scale, ShieldCheck, HelpCircle } from 'lucide-react';
import { sound } from '../systems/audio';
import { useProgress } from '../systems/save';
import { RPG_BRANCHES_DATA, RPGCharacterBranch, RPGChoiceOption, RPGSubChoice, RPGSingleEnding } from '../data/rpg-branches';

export interface RPGDialogueData {
  npcId: string;
  npcName: string;
  role: string;
  scenarioId: string;
}

const CELEBRITY_PORTRAITS: Record<string, string> = {
  scenario_jack_j97: 'assets/characters/jack.png',
  npc_jack_j97: 'assets/characters/jack.png',
  scenario_nathan_lee_copyright: 'assets/characters/kicm.png',
  npc_nathan_lee_copyright: 'assets/characters/kicm.png',
  scenario_kicm_producer: 'assets/characters/kicm.png',
  npc_kicm_producer: 'assets/characters/kicm.png',
  scenario_vinfast_pham_nhat_vuong: 'assets/characters/pham_nhat_vuong.png',
  npc_vinfast_pham_nhat_vuong: 'assets/characters/pham_nhat_vuong.png',
  scenario_tran_thanh_cinema: 'assets/characters/tran_thanh.png',
  npc_tran_thanh_cinema: 'assets/characters/tran_thanh.png',
  scenario_ceo_phuong_hang: 'assets/characters/phuong_hang.png',
  npc_ceo_phuong_hang: 'assets/characters/phuong_hang.png',
  scenario_hoai_linh_charity: 'assets/characters/hoai_linh.png',
  npc_hoai_linh_charity: 'assets/characters/hoai_linh.png',
  scenario_quang_linh_kera: 'assets/characters/quang_linh.png',
  npc_quang_linh_kera: 'assets/characters/quang_linh.png',
  scenario_thuy_tien_kera: 'assets/characters/thuy_tien.png',
  npc_thuy_tien_kera: 'assets/characters/thuy_tien.png',
  scenario_cuc_thue_so_boss: 'assets/characters/cuc_thue.png',
  npc_cuc_thue_so_boss: 'assets/characters/cuc_thue.png',
};

interface Props {
  dialogueData: RPGDialogueData | null;
  scenario: any | null; // Tương thích với dữ liệu truyền vào
  onClose: () => void;
  onClearScenario?: (scenarioId: string) => void;
}

export const RPGDialogueModal: React.FC<Props> = ({
  dialogueData,
  onClose,
  onClearScenario,
}) => {
  const [progress, saveProgress] = useProgress();

  // Lấy dữ liệu phân nhánh theo scenarioId
  const branchData: RPGCharacterBranch | undefined = dialogueData
    ? RPG_BRANCHES_DATA[dialogueData.scenarioId]
    : undefined;

  const avatarSrc = branchData
    ? CELEBRITY_PORTRAITS[branchData.id] || CELEBRITY_PORTRAITS[branchData.npcId]
    : undefined;

  // Trạng thái chuỗi quyết định (Multi-step decision flow)
  // Step 1: Lựa chọn định hướng lớn
  // Step 2: Lựa chọn phương án chi tiết (nếu có subOptions)
  // Step 3 (Resolved): Hiển thị Ending tương ứng với chuỗi lựa chọn
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedStep1, setSelectedStep1] = useState<RPGChoiceOption | null>(null);
  const [selectedStep2, setSelectedStep2] = useState<RPGSubChoice | null>(null);
  const [activeEnding, setActiveEnding] = useState<RPGSingleEnding | null>(null);

  if (!dialogueData || !branchData) return null;

  // Kiểm tra phản ứng qua lại (Reaction) dựa trên quyết sách với các NPC khác trong khu
  let contextReactionDialogue: string | null = null;
  for (const reaction of branchData.reactions) {
    const priorDecision = progress.rpgDecisions?.[reaction.prerequisiteNpcId];
    if (priorDecision) {
      if (!reaction.prerequisiteEndingId || reaction.prerequisiteEndingId === priorDecision.endingId) {
        contextReactionDialogue = reaction.reactionDialogue;
        break;
      }
    }
  }

  // Quyết định trước đó của NPC này nếu đã giải quyết
  const priorSelfDecision = progress.rpgDecisions?.[branchData.id];

  // Xử lý chọn Step 1
  const handleSelectStep1 = (opt: RPGChoiceOption) => {
    setSelectedStep1(opt);
    if (opt.subOptions && opt.subOptions.length > 0) {
      sound.playClick();
      setCurrentStep(2);
    } else if (opt.endingId && branchData.endings[opt.endingId]) {
      const ending = branchData.endings[opt.endingId];
      setActiveEnding(ending);
      sound.playHit();
      setCurrentStep(3);
    }
  };

  // Xử lý chọn Step 2
  const handleSelectStep2 = (subOpt: RPGSubChoice) => {
    setSelectedStep2(subOpt);
    const ending = branchData.endings[subOpt.endingId];
    if (ending) {
      setActiveEnding(ending);
      if (ending.category === 'socialist') {
        sound.playVictory();
      } else if (ending.category === 'capitalist') {
        sound.playWrong();
      } else {
        sound.playHit();
      }
      setCurrentStep(3);
    }
  };

  // Xác nhận lưu Ending đạt được và hoàn tất
  const handleConfirmEnding = () => {
    if (!activeEnding) return;

    const newDecisions = {
      ...(progress.rpgDecisions || {}),
      [branchData.id]: {
        scenarioId: branchData.id,
        stepChoices: [
          selectedStep1?.id || '',
          selectedStep2?.id || '',
        ].filter(Boolean),
        endingId: activeEnding.id,
        endingTitle: activeEnding.title,
        category: activeEnding.category,
        resolvedAt: Date.now(),
      },
    };

    const newBadges = progress.badges.includes(branchData.id)
      ? progress.badges
      : [...progress.badges, branchData.id];

    saveProgress({
      rpgDecisions: newDecisions,
      badges: newBadges,
    });

    if (onClearScenario) {
      onClearScenario(branchData.id);
    }

    onClose();
  };

  // Đặt lại để chọn lại chuỗi quyết sách khác
  const handleResetChoices = () => {
    setCurrentStep(1);
    setSelectedStep1(null);
    setSelectedStep2(null);
    setActiveEnding(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      style={{ touchAction: 'manipulation' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl bg-slate-900/95 border-2 border-amber-500/80 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* ======================================================== */}
        {/* CỘT BÊN TRÁI: ẢNH CHÂN DUNG NGƯỜI THẬT TO RÕ (VISUAL NOVEL / RPG STYLE) */}
        {/* ======================================================== */}
        <div className="w-full md:w-72 lg:w-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-800 relative flex-shrink-0">
          {/* Nút đóng trên mobile */}
          <div className="md:hidden absolute top-3 right-3 z-10">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* District Tag (Desktop) */}
          <div className="hidden md:flex flex-col items-center w-full mb-3">
            <span className="text-[10px] font-bold text-amber-400/90 tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-center">
              {branchData.districtName}
            </span>
          </div>

          {/* Khung ảnh chân dung siêu to & nét */}
          <div className="relative w-20 h-24 sm:w-28 sm:h-32 md:w-full md:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 bg-slate-950/80 flex-shrink-0 group flex items-center justify-center">
            {/* Lớp nền mờ chuyển sắc */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${branchData.bgGradient} opacity-20`} />

            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={branchData.name}
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500 filter drop-shadow-2xl"
              />
            ) : (
              <div className="text-5xl">{branchData.avatarIcon}</div>
            )}

            {/* Viền sáng bao bọc */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl pointer-events-none" />
          </div>

          {/* Thông tin nhân vật */}
          <div className="flex-1 md:w-full ml-4 md:ml-0 md:mt-3 flex flex-col items-start md:items-center text-left md:text-center justify-center">
            <h3 className="font-black text-sm sm:text-base md:text-lg text-slate-100 tracking-tight">
              {branchData.name}
            </h3>
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 mt-1">
              {branchData.role}
            </span>

            {/* Trạng thái phán quyết */}
            {priorSelfDecision ? (
              <span className="mt-2 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã Phán Quyết
              </span>
            ) : (
              <span className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Chờ Trọng Tài Phán Quyết
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CỘT BÊN PHẢI: KHUNG ĐỐI THOẠI & CÁC LỰA CHỌN PHÂN NHÁNH */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header thanh trên của cột phải (Desktop) */}
          <div className="hidden md:flex bg-slate-950 px-5 py-3 border-b border-slate-800 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-400" />
                Phiên Tòa Trọng Tài Thể Chế Kinh Tế
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Vùng cuộn nội dung đối thoại RPG */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar flex-1 max-h-[70vh] md:max-h-[82vh]">
          {/* 1. Phản ứng liên đới qua lại từ nhân vật khác trong khu vực */}
          {contextReactionDialogue && (
            <div className="relative bg-purple-950/40 border border-purple-500/60 rounded-2xl p-3.5 shadow-inner animate-in fade-in duration-300">
              <div className="absolute -top-2.5 left-5 px-2 py-0.5 bg-purple-500 text-slate-950 font-black text-[9px] rounded uppercase tracking-wider flex items-center gap-1">
                <span>⚡</span> Phản Ứng Tương Tác Qua Lại Trong Khu Vực
              </div>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed italic mt-0.5 font-sans font-medium">
                "{contextReactionDialogue}"
              </p>
            </div>
          )}

          {/* 2. Lời trần tình chính của NPC */}
          <div className="relative bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-inner">
            <div className="absolute -top-2.5 left-5 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded uppercase tracking-wider">
              Lời Trần Tình Của NPC
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic mt-0.5 font-sans font-medium">
              "{branchData.initialPrompt}"
            </p>
          </div>

          {/* GIAI ĐOẠN 1: CHỌN ĐỊNH HƯỚNG LẬP TRƯỜNG */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] font-black text-amber-400 uppercase tracking-wider">
                <span>💬 Bước 1: Chọn Định Hướng Chiến Lược Của Bạn:</span>
                <span className="text-slate-400 font-mono text-[10px]">Nhấn để mở nhánh chi tiết</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {branchData.step1Options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectStep1(opt)}
                    className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border-2 border-slate-800 hover:border-amber-500/80 text-left transition-all cursor-pointer group flex items-start gap-3 shadow-md active:scale-[0.99]"
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center flex-shrink-0 transition-colors">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-200 leading-snug">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                        <span className={opt.stance === 'socialist' ? 'text-emerald-400' : opt.stance === 'capitalist' ? 'text-rose-400' : 'text-blue-400'}>
                          ● {opt.stance === 'socialist' ? 'Định hướng XHCN & Bảo vệ người lao động' : opt.stance === 'capitalist' ? 'Tư bản tự do & Thị trường thuần túy' : 'Hòa giải / Điều tiết'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 2: CHỌN QUYẾT SÁCH CHI TIẾT (SUB-OPTIONS) */}
          {currentStep === 2 && selectedStep1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* NPC Phản hồi bước 1 */}
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3.5 text-xs text-amber-200 leading-relaxed italic">
                <span className="font-bold text-amber-400 block not-italic mb-1">
                  💬 Phản hồi của {branchData.name}:
                </span>
                "{selectedStep1.dialogueResponse}"
              </div>

              <div className="flex items-center justify-between text-[11px] font-black text-amber-400 uppercase tracking-wider">
                <span>⚖️ Bước 2: {selectedStep1.nextStepPrompt || 'Chọn Giải Pháp Thực Thi Cụ Thể:'}</span>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  ← Đổi hướng bước 1
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {selectedStep1.subOptions?.map((subOpt, idx) => (
                  <button
                    key={subOpt.id}
                    onClick={() => handleSelectStep2(subOpt)}
                    className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border-2 border-slate-800 hover:border-emerald-500 text-left transition-all cursor-pointer group flex items-start gap-3 shadow-md active:scale-[0.99]"
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center flex-shrink-0 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-200 leading-snug">
                      {subOpt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 3: KẾT CỤC ĐẠT ĐƯỢC (ENDING SCREEN) */}
          {currentStep === 3 && activeEnding && (
            <div
              className={`p-5 rounded-2xl border-2 space-y-4 animate-in zoom-in-95 duration-200 ${
                activeEnding.category === 'socialist'
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                  : activeEnding.category === 'compromise'
                  ? 'bg-blue-950/40 border-blue-500/80 text-blue-200'
                  : activeEnding.category === 'capitalist'
                  ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                  : 'bg-amber-950/40 border-amber-500/80 text-amber-200'
              }`}
            >
              {/* Header Kết Cục */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={branchData.name}
                      className="w-11 h-11 rounded-xl object-cover object-top border-2 border-white/20 shadow-md flex-shrink-0"
                    />
                  ) : (
                    <span className="text-2xl">{activeEnding.icon}</span>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      Kết Cục Phán Quyết Cho {branchData.name}:
                    </span>
                    <span className="text-sm font-black text-white">
                      {activeEnding.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tóm tắt kết cục */}
              <p className="text-xs font-semibold leading-relaxed text-slate-200">
                {activeEnding.summary}
              </p>

              {/* Hệ quả thực tế đối với xã hội & thị trường */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 text-xs space-y-1">
                <span className="font-bold text-amber-300 block text-[11px]">
                  🌐 HỆ QUẢ ĐỐI VỚI NỀN KINH TẾ & XÃ HỘI:
                </span>
                <p className="text-slate-300">{activeEnding.socialConsequence}</p>
              </div>

              {/* Căn cứ giáo trình Kinh tế chính trị Mác - Lênin */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 text-xs space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> CĂN CỨ GIÁO TRÌNH KINH TẾ CHÍNH TRỊ MÁC - LÊNIN:
                </span>
                <p className="text-slate-300">{activeEnding.marxistFoundation}</p>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleResetChoices}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Thử Nhánh Quyết Sách Khác</span>
                </button>

                <button
                  onClick={handleConfirmEnding}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all ${
                    activeEnding.category === 'socialist'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110'
                      : activeEnding.category === 'compromise'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-400 text-white hover:brightness-110'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Xác Nhận Phán Quyết Này & Tiếp Tục</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
