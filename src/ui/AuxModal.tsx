import React from 'react';
import { X, User, Award, Trophy, Settings, Volume2, VolumeX, Shield, RotateCcw } from 'lucide-react';
import { EventBus } from '../game/EventBus';
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <img
                    src={`assets/kenney/rpg-urban/Tiles/tile_${(progress.playerSkin * 3 * 27 + 23).toString().padStart(4, '0')}.png`}
                    alt="Player"
                    className="w-10 h-10 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-100">{progress.playerName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      {progress.playerGender === 'female' ? '👧 Nữ' : '👦 Nam'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">Sinh viên KTCT Mác - Lênin</p>
                  <p className="text-[11px] text-slate-400 mt-1">Cấp độ: Nhà Cải Cách Tập Sự</p>
                </div>
              </div>

              {/* Nút mở modal chỉnh sửa nhân vật & giới tính */}
              <button
                onClick={() => {
                  onClose();
                  EventBus.emit('open-character-creation');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>👤 Đổi Tên & Giới Tính Nhân Vật</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Sao Trắc Nghiệm</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{totalStars} / 60</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Huy Hiệu Thể Chế</span>
                  <span className="text-lg font-black text-rose-400 font-mono">{progress.badges.length} / 9</span>
                </div>
              </div>
            </div>
          )}

          {/* BADGES MODAL */}
          {type === 'badges' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">
                Chiến thắng các tình huống mô phỏng tại Khu 1 và Khu 2 để thu thập các Huy hiệu danh giá:
              </p>

              {[
                { id: 'scenario_jack_j97', title: 'Huy hiệu Bản Quyền Nghệ Sĩ', desc: 'Bảo vệ quyền tác giả và chống hợp đồng độc quyền bóc lột (Jack J97)' },
                { id: 'scenario_nathan_lee_copyright', title: 'Huy hiệu Hòa Âm & Quyền Liên Quan', desc: 'Công nhận công sức Producer và phân chia lợi nhuận bản phối công bằng (K-ICM)' },
                { id: 'scenario_pham_nhat_vuong_vinfast', title: 'Huy hiệu Tiên Phong Công Nghiệp Xanh', desc: 'Kiến tạo cơ chế ưu đãi cho xe điện và chuỗi cung ứng công nghệ cao (Phạm Nhật Vượng)' },
                { id: 'scenario_tran_thanh_rap_phim', title: 'Huy hiệu Cạnh Tranh Điện Ảnh Lành Mạnh', desc: 'Chống độc quyền cụm rạp và bảo vệ thị phần phim nội địa (Trấn Thành)' },
                { id: 'scenario_phuong_hang_livestream', title: 'Huy hiệu Chuẩn Mực Livestream & Phát Ngôn', desc: 'Quản lý không gian mạng, chống bôi nhọ và bảo vệ trật tự kinh tế số (Bà Phương Hằng)' },
                { id: 'scenario_hoai_linh_tu_thien', title: 'Huy hiệu Pháp Lý Quỹ Thiện Nguyện', desc: 'Minh bạch quy chế tiếp nhận và giải ngân tiền từ thiện cộng đồng (Hoài Linh)' },
                { id: 'scenario_thuy_tien_cong_vinh_cuu_tro', title: 'Huy hiệu Chuẩn Hóa Cứu Trợ Khẩn Cấp', desc: 'Quy chuẩn hóa hoạt động cứu trợ thiên tai có giám sát ngân hàng (Thủy Tiên)' },
                { id: 'scenario_quang_linh_vlogs_chau_phi', title: 'Huy hiệu Ngoại Giao Nhân Dân & Nông Nghiệp', desc: 'Phát triển thương hiệu quốc gia và liên kết nông sản xuyên biên giới (Quang Linh Vlogs)' },
                { id: 'scenario_cuc_thue_thuong_mai_dien_tu', title: 'Huy hiệu Minh Bạch Thuế Số & TMĐT', desc: 'Hoàn thiện thể chế quản lý thuế thương mại điện tử và kinh tế số (Cục Thuế)' },
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
                { rank: 1, name: 'Trần Minh Quang', stars: 58, badges: 9, title: 'Thần Rùa Thể Chế' },
                { rank: 2, name: 'Nguyễn Thị Ánh', stars: 52, badges: 8, title: 'Chuyên Gia Cân Bằng' },
                { rank: 3, name: 'Lê Hoàng Phong', stars: 45, badges: 7, title: 'Tân Binh Đổi Mới' },
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
