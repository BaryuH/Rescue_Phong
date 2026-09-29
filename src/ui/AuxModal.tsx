import React from 'react';
import { X, User, Award, Trophy, Settings, Volume2, VolumeX, Shield, RotateCcw } from 'lucide-react';
import { useProgress, resetProgress } from '../systems/save';
import { getTotalStars, REQUIRED_STARS_FOR_CHAPTER_2, REQUIRED_BADGES_FOR_KHU_2 } from '../systems/progress';

export type ModalType = 'profile' | 'badges' | 'leaderboard' | 'settings';

interface Props {
  type: ModalType | null;
  onClose: () => void;
}

export const AuxModal: React.FC<Props> = ({ type, onClose }) => {
  const [progress, saveProgress] = useProgress();

  if (!type) return null;

  const totalStars = getTotalStars(progress.quizStars);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            {type === 'profile' && <User className="w-5 h-5 text-indigo-400" />}
            {type === 'badges' && <Award className="w-5 h-5 text-amber-400" />}
            {type === 'leaderboard' && <Trophy className="w-5 h-5 text-purple-400" />}
            {type === 'settings' && <Settings className="w-5 h-5 text-slate-400" />}
            <h2 className="font-black text-sm sm:text-base text-slate-100 uppercase tracking-wide">
              {type === 'profile' && 'Hồ Sơ Nhà Cải Cách'}
              {type === 'badges' && 'Phòng Truyền Thống Huy Hiệu'}
              {type === 'leaderboard' && 'Bảng Xếp Hạng Sinh Viên'}
              {type === 'settings' && 'Trạm Cài Đặt Hệ Thống'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* PROFILE MODAL */}
          {type === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-black text-2xl text-slate-950 shadow-inner">
                  P
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">{progress.playerName}</h3>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">Sinh viên KTCT Mác - Lênin</p>
                  <p className="text-[11px] text-slate-400 mt-1">Cấp độ: Nhà Cải Cách Tập Sự</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Sao Trắc Nghiệm</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{totalStars} / 30</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Huy Hiệu Thể Chế</span>
                  <span className="text-lg font-black text-rose-400 font-mono">{progress.badges.length} / 3</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">Đổi Trang Phục Nhân Vật</span>
                <div className="grid grid-cols-6 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((skinId) => (
                    <button
                      key={skinId}
                      onClick={() => saveProgress({ playerSkin: skinId })}
                      className={`h-12 rounded-xl border flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                        progress.playerSkin === skinId
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Skin {skinId + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BADGES MODAL */}
          {type === 'badges' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">
                Chiến thắng các tình huống mô phỏng tại Khu 1 để thu thập đủ 3 Huy hiệu Thể chế mở khóa Khu 2:
              </p>

              {[
                { id: 'scenario_binh_dang_nguon_luc', title: 'Huy hiệu Bình Đẳng Nguồn Lực', desc: 'Tháo gỡ rào cản pháp lý cho doanh nghiệp tư nhân' },
                { id: 'scenario_so_huu_tri_tue_cong_nghe', title: 'Huy hiệu Bảo Hộ Sáng Tạo', desc: 'Bảo vệ quyền sở hữu trí tuệ cho startup công nghệ' },
                { id: 'scenario_hop_tac_xa_nong_san', title: 'Huy hiệu Liên Kết Nông Sản', desc: 'Đổi mới chuỗi giá trị cho kinh tế tập thể' },
                { id: 'scenario_dau_tu_fdi_cong_nghe', title: 'Huy hiệu Thu Hút FDI Chọn Lọc', desc: 'Cam kết chuyển giao công nghệ từ nước ngoài' },
                { id: 'scenario_minh_bach_dau_thau_cong', title: 'Huy hiệu Minh Bạch Đấu Thầu', desc: 'Kiên quyết xóa bỏ quy định cài cắm bất hợp lý' },
                { id: 'scenario_cai_to_dnnn_then_chot', title: 'Huy Chương Vàng Trùm DNNN', desc: 'Cơ cấu lại doanh nghiệp nhà nước then chốt' },
              ].map((badge) => {
                const isEarned = progress.badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      isEarned
                        ? 'bg-amber-950/30 border-amber-500/80 text-amber-200'
                        : 'bg-slate-950/40 border-slate-800 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isEarned ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{badge.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEADERBOARD MODAL */}
          {type === 'leaderboard' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-3">Bảng xếp hạng thành tích sinh viên trong môn học:</p>
              {[
                { rank: 1, name: 'Trần Minh Quang', stars: 30, badges: 3, title: 'Thần Rùa Thể Chế' },
                { rank: 2, name: 'Nguyễn Thị Ánh', stars: 28, badges: 3, title: 'Chuyên Gia Cân Bằng' },
                { rank: 3, name: 'Lê Hoàng Phong', stars: 25, badges: 2, title: 'Tân Binh Đổi Mới' },
                { rank: 4, name: progress.playerName, stars: totalStars, badges: progress.badges.length, isUser: true, title: 'Nhà Cải Cách' },
              ]
                .sort((a, b) => b.stars - a.stars)
                .map((row, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      row.isUser
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-mono font-black text-sm text-amber-400">#{idx + 1}</span>
                      <div>
                        <div className="font-bold text-xs text-slate-100">{row.name} {row.isUser && '(Bạn)'}</div>
                        <div className="text-[10px] text-slate-400">{row.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono font-bold">
                      <span className="text-amber-400">{row.stars} ⭐</span>
                      <span className="text-rose-400">{row.badges} 🏅</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* SETTINGS MODAL */}
          {type === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Hiệu ứng âm thanh (SFX)</span>
                  <button
                    onClick={() =>
                      saveProgress({
                        settings: { ...progress.settings, soundEnabled: !progress.settings.soundEnabled },
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      progress.settings.soundEnabled
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {progress.settings.soundEnabled ? 'BẬT' : 'TẮT'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Giảm chuyển động (Reduced Motion)</span>
                  <button
                    onClick={() =>
                      saveProgress({
                        settings: { ...progress.settings, reducedMotion: !progress.settings.reducedMotion },
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      progress.settings.reducedMotion
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {progress.settings.reducedMotion ? 'BẬT' : 'TẮT'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-rose-300">Đặt Lại Toàn Bộ Tiến Độ</div>
                  <div className="text-[10px] text-rose-400/80">Xóa vĩnh viễn sao và huy hiệu đã lưu</div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa hết tiến độ và chơi lại từ đầu không?')) {
                      resetProgress();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
