import React from 'react';
import { X, Award, CheckCircle2, Clock, Sparkles, Scale, Heart, Coins, ShieldCheck, ChevronRight } from 'lucide-react';
import { useProgress } from '../systems/save';
import { sound } from '../systems/audio';
import { RPG_BRANCHES_DATA, DISTRICT_GRAND_ENDINGS } from '../data/rpg-branches';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FinalCodexModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [progress] = useProgress();

  if (!isOpen) return null;

  const decisions = progress.rpgDecisions || {};
  const clearedCount = Object.keys(decisions).length;
  const isPerfect = clearedCount >= 10;
  const isHigh = clearedCount >= 6;

  // Tính 3 chỉ số vĩ mô dựa trên các endings thực tế đạt được
  let totalInst = 50;
  let totalWelf = 45;
  let totalBudg = 100;

  Object.values(decisions).forEach((dec) => {
    const branch = RPG_BRANCHES_DATA[dec.scenarioId];
    if (branch && branch.endings[dec.endingId]) {
      const e = branch.endings[dec.endingId];
      totalInst += e.institutionScore > 80 ? 4.8 : 2.0;
      totalWelf += e.welfareScore > 80 ? 5.1 : 2.0;
      totalBudg += e.budgetGain;
    }
  });

  const institutionScore = Math.min(Math.round(totalInst), 98);
  const welfareScore = Math.min(Math.round(totalWelf), 96);
  const budgetGain = Math.max(0, Math.min(Math.round(totalBudg), 420));

  // Kiểm tra 4 khu vực đã hoàn thành chưa để mở khóa District Grand Ending
  const district1Cleared = ['scenario_jack_j97', 'scenario_icm_entertainment', 'scenario_nathan_lee_copyright'].every(
    (id) => !!decisions[id]
  );
  const district2Cleared = ['scenario_vinfast_pham_nhat_vuong', 'scenario_tran_thanh_cinema'].every(
    (id) => !!decisions[id]
  );
  const district3Cleared = ['scenario_ceo_phuong_hang', 'scenario_hoai_linh_charity'].every(
    (id) => !!decisions[id]
  );
  const district4Cleared = ['scenario_quang_linh_kera', 'scenario_thuy_tien_kera', 'scenario_cuc_thue_so_boss'].every(
    (id) => !!decisions[id]
  );

  const getDistrictGrandEnding = (districtId: 1 | 2 | 3 | 4, isCleared: boolean) => {
    if (!isCleared) return null;
    // Kiểm tra xem phần lớn ending là socialist hay mixed
    const districtNpcIds = Object.keys(RPG_BRANCHES_DATA).filter(
      (k) => RPG_BRANCHES_DATA[k].districtId === districtId
    );
    const socialistCount = districtNpcIds.filter(
      (id) => decisions[id]?.category === 'socialist'
    ).length;

    const isDominantSocialist = socialistCount >= districtNpcIds.length / 2;
    return isDominantSocialist
      ? DISTRICT_GRAND_ENDINGS[districtId].socialist
      : DISTRICT_GRAND_ENDINGS[districtId].mixed;
  };

  const d1Ending = getDistrictGrandEnding(1, district1Cleared);
  const d2Ending = getDistrictGrandEnding(2, district2Cleared);
  const d3Ending = getDistrictGrandEnding(3, district3Cleared);
  const d4Ending = getDistrictGrandEnding(4, district4Cleared);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      style={{ touchAction: 'manipulation' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/90 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-600/30 via-slate-950 to-amber-600/30 px-5 py-4 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg">
              👑
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-amber-300 tracking-wide uppercase flex items-center gap-2">
                <span>The Final Codex • Sổ Phán Quyết & Kết Cục Thể Chế</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400">
                Lưu giữ các nhánh kết cục và tương tác liên đới giữa 10 nhân vật trong 4 phân khu thể chế
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung danh sách */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 no-scrollbar">
          {/* Banner Xếp hạng Chung cuộc */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl ${
              isPerfect
                ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 border-amber-400 text-amber-200'
                : isHigh
                ? 'bg-slate-950/90 border-teal-500/80 text-teal-200'
                : 'bg-slate-950/90 border-slate-700 text-slate-300'
            }`}
          >
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-black tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Tiến Độ Phán Quyết Thể Chế:</span>
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300">
                {isPerfect
                  ? '🏆 ĐÃ KHÁM PHÁ TRỌN VẸN 10 KẾT CỤC THỂ CHẾ (10/10)'
                  : isHigh
                  ? `🥈 ĐÃ PHÁN QUYẾT (${clearedCount}/10) NHÂN VẬT`
                  : `🥉 BẮT ĐẦU ĐIỀU HÀNH (${clearedCount}/10) NHÂN VẬT`}
              </div>
              <p className="text-[11px] text-slate-400 max-w-xl">
                Mỗi kết hợp lựa chọn của bạn giữa các nhân vật trong cùng phân khu sẽ đưa đến những kết cục hoàn toàn khác nhau. Bạn có thể phán quyết lại bất cứ lúc nào!
              </p>
            </div>

            {/* 3 Chỉ số vĩ mô */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <Scale className="w-3 h-3" /> Thể Chế
                </div>
                <div className="text-sm sm:text-base font-black text-slate-100">{institutionScore}%</div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-teal-500/40 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-teal-400 font-bold">
                  <Heart className="w-3 h-3" /> An Sinh
                </div>
                <div className="text-sm sm:text-base font-black text-slate-100">{welfareScore}%</div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold">
                  <Coins className="w-3 h-3" /> Ngân Sách
                </div>
                <div className="text-sm sm:text-base font-black text-slate-100">+{budgetGain} Tỷ</div>
              </div>
            </div>
          </div>

          {/* KHỐI 1: KẾT CỤC TOÀN KHU (DISTRICT GRAND ENDINGS) */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>🌐 KẾT CỤC TOÀN KHU (TỔNG HÒA QUYẾT SÁCH LIÊN ĐỚI 4 PHÂN KHU):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                { title: 'Nhà Hát Nghệ Thuật & Showbiz', ending: d1Ending, isDone: district1Cleared, count: '3/3' },
                { title: 'Xưởng Xe Điện & Điện Ảnh', ending: d2Ending, isDone: district2Cleared, count: '2/2' },
                { title: 'Studio Livestream & Sao Kê', ending: d3Ending, isDone: district3Cleared, count: '2/2' },
                { title: 'Tòa Án & Trại Tạm Giam (Đại Án Kera)', ending: d4Ending, isDone: district4Cleared, count: '3/3' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.isDone
                      ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-amber-500/70 shadow-md'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {item.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {item.isDone ? '✓ ĐÃ MỞ KHÓA KẾT CỤC' : `Chưa xong (${item.count})`}
                    </span>
                  </div>

                  {item.ending ? (
                    <div className="space-y-1">
                      <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                        <span>{item.ending.icon}</span>
                        <span>{item.ending.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        {item.ending.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">
                      Hãy hoàn thành tất cả nhân vật trong phân khu này để kích hoạt Kết Cục Toàn Khu!
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI 2: CHI TIẾT 10 NHÂN VẬT & NHÁNH KẾT CỤC ĐÃ ĐẠT ĐƯỢC */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>👤 CHI TIẾT KẾT CỤC RIÊNG CỦA TỪNG NHÂN VẬT:</span>
              <span className="text-amber-400 font-mono">({clearedCount}/10 Đã Hoàn Thành)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(RPG_BRANCHES_DATA).map((branch) => {
                const decision = decisions[branch.id];
                const ending = decision ? branch.endings[decision.endingId] : null;

                return (
                  <div
                    key={branch.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      decision
                        ? 'bg-slate-950/80 border-emerald-500/60 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${branch.bgGradient} flex items-center justify-center text-xl flex-shrink-0 shadow`}
                    >
                      {branch.avatarIcon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-slate-100 truncate">{branch.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold truncate max-w-[120px]">
                            {branch.role}
                          </span>
                        </div>

                        {decision ? (
                          <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Phán Quyết
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" /> Chờ Phán Quyết
                          </span>
                        )}
                      </div>

                      {ending ? (
                        <>
                          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                            <span>{ending.icon}</span>
                            <span className="truncate">{ending.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                            {ending.summary}
                          </div>
                          <div className="text-[9.5px] text-emerald-400 font-mono pt-0.5">
                            📚 {ending.marxistFoundation}
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic">
                          Chưa gặp gỡ và đưa ra phán quyết phân nhánh cho nhân vật này.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Giáo trình KTCT Mác - Lênin (Trang 187 – 214) • Mô hình hóa thể chế tương tác đa chủ thể
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            Đóng Sổ Phán Quyết
          </button>
        </div>
      </div>
    </div>
  );
};
