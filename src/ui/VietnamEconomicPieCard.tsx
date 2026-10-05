import React, { useState } from 'react';
import { Sparkles, Info, X, ShieldCheck, Landmark, Factory, Wheat, DollarSign, Award, ChevronRight } from 'lucide-react';
import { sound } from '../systems/audio';

export const ECONOMIC_PIE_SECTORS = [
  {
    id: 'services',
    label: 'Khu vực Dịch vụ',
    shortLabel: 'Dịch vụ',
    percent: 42.5,
    color: '#38bdf8', // Neon Sky Blue
    glow: 'rgba(56, 189, 248, 0.7)',
    icon: Landmark,
    desc: 'Thương mại điện tử, tài chính ngân hàng, logistics cảng biển, du lịch, kinh tế số và dịch vụ công ích.',
    roleInXHCN: 'Động lực kết nối thị trường trong nước và chuỗi cung ứng toàn cầu, tối ưu hóa lưu thông của cải.',
  },
  {
    id: 'industry',
    label: 'Công nghiệp & Xây dựng',
    shortLabel: 'Công nghiệp',
    percent: 37.8,
    color: '#10b981', // Emerald Green
    glow: 'rgba(16, 185, 129, 0.7)',
    icon: Factory,
    desc: 'Công nghiệp chế biến chế tạo, bán dẫn công nghệ cao, hạ tầng giao thông và năng lượng tái tạo then chốt.',
    roleInXHCN: 'Nền tảng vật chất - kỹ thuật cốt lõi của CNXH, hiện đại hóa lực lượng sản xuất theo chiều sâu.',
  },
  {
    id: 'agriculture',
    label: 'Nông, Lâm & Thủy sản',
    shortLabel: 'Nông nghiệp',
    percent: 11.9,
    color: '#f59e0b', // Amber Gold
    glow: 'rgba(245, 158, 11, 0.7)',
    icon: Wheat,
    desc: 'Lương thực thực phẩm sinh thái, kinh tế tuần hoàn nông nghiệp, xuất khẩu gạo và thủy sản top đầu thế giới.',
    roleInXHCN: 'Bệ đỡ an ninh lương thực quốc gia vững chắc, đảm bảo ổn định chính trị - xã hội và nông thôn mới.',
  },
  {
    id: 'taxes',
    label: 'Thuế SP trừ Trợ cấp',
    shortLabel: 'Thuế & An sinh',
    percent: 7.8,
    color: '#f43f5e', // Rose Coral
    glow: 'rgba(244, 63, 94, 0.7)',
    icon: DollarSign,
    desc: 'Nguồn thu ngân sách Nhà nước phục vụ tái phân phối thặng dư và trợ giá các mặt hàng thiết yếu.',
    roleInXHCN: 'Công cụ điều tiết vĩ mô, bảo đảm y tế, phổ cập giáo dục miễn phí và giảm nghèo đa chiều bền vững.',
  },
];

export const VietnamEconomicPieCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<typeof ECONOMIC_PIE_SECTORS[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Tính tọa độ SVG pie slices dạng Exploded 3D Pie Chart
  let cumulativePercent = 0;

  const slices = ECONOMIC_PIE_SECTORS.map((sector) => {
    const startAngle = (cumulativePercent * 360) / 100 - 90;
    cumulativePercent += sector.percent;
    const endAngle = (cumulativePercent * 360) / 100 - 90;

    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const cx = 50;
    const cy = 50;
    const r = 38;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = sector.percent > 50 ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const isHovered = hoveredId === sector.id;
    const offset = isHovered ? 4.5 : 0;
    const dx = offset * Math.cos(midRad);
    const dy = offset * Math.sin(midRad);

    return {
      ...sector,
      pathData,
      dx,
      dy,
      isHovered,
    };
  });

  const currentHoveredSector = ECONOMIC_PIE_SECTORS.find((s) => s.id === hoveredId);

  return (
    <>
      {/* THẺ BẢNG ĐIỀU KHIỂN CHIẾC BÁNH KINH TẾ (THAY THẾ HÀNG HÒM BÁU VẬT) */}
      <div
        className={`relative bg-gradient-to-b from-[#221334]/95 via-[#160c26]/95 to-[#0b0517]/95 border-2 border-amber-400/80 p-3 sm:p-3.5 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col items-center justify-between transition-all hover:border-amber-300 w-44 sm:w-56 md:w-60 select-none shrink-0 ${className}`}
        style={{
          boxShadow: '0 12px 35px rgba(0,0,0,0.85), inset 0 1px 18px rgba(251,191,36,0.18)',
        }}
      >
        {/* TIÊU ĐỀ THẺ */}
        <div className="w-full flex items-center justify-between border-b border-amber-500/30 pb-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg animate-pulse">🇻🇳</span>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                BÁNH KINH TẾ VN
              </span>
              <span className="text-[8px] font-bold text-amber-400/80">
                GDP ~470 TỶ USD • 2024
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowDetailModal(true);
            }}
            title="Xem chi tiết chiếc bánh kinh tế & triết lý phân phối XHCN"
            className="w-5 h-5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400 text-amber-300 flex items-center justify-center text-[10px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        {/* HÌNH VẼ CHIẾC BÁNH KINH TẾ SVG 3D NEON GLOW CÓ EXPLODED PIE EFFECT */}
        <div
          className="relative w-28 h-28 sm:w-34 sm:h-34 my-1 flex items-center justify-center cursor-pointer group"
          onClick={() => {
            sound.playClick();
            setShowDetailModal(true);
          }}
          title="Bấm vào để mở rộng bài phân tích chiếc bánh kinh tế"
        >
          {/* Hào quang nền phía sau */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-r from-amber-500/25 via-sky-500/20 to-emerald-500/25 blur-md pointer-events-none group-hover:opacity-100 transition-opacity" />

          {/* Vòng SVG biểu đồ miếng bánh */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-12 filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] transition-transform group-hover:scale-105 duration-300"
          >
            {slices.map((slice) => (
              <path
                key={slice.id}
                d={slice.pathData}
                fill={slice.color}
                stroke="#0b0517"
                strokeWidth="1.5"
                onMouseEnter={() => {
                  sound.playClick();
                  setHoveredId(slice.id);
                }}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  transform: `translate(${slice.dx}px, ${slice.dy}px)`,
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
                  filter: slice.isHovered
                    ? `drop-shadow(0 0 8px ${slice.glow}) brightness(1.2)`
                    : `drop-shadow(0 0 3px ${slice.glow})`,
                  opacity: hoveredId && !slice.isHovered ? 0.75 : 1,
                }}
              />
            ))}

            {/* Lõi tâm chiếc bánh: Biểu tượng Cờ Đỏ Sao Vàng Xã Hội Chủ Nghĩa hoặc Số % khi hover */}
            <circle
              cx="50"
              cy="50"
              r="13"
              fill="#0b0517"
              stroke="#fbbf24"
              strokeWidth="2"
              className="transition-all"
            />

            {currentHoveredSector ? (
              <text
                x="50"
                y="53.5"
                textAnchor="middle"
                fill={currentHoveredSector.color}
                fontSize="6.5"
                fontWeight="900"
                className="select-none"
              >
                {currentHoveredSector.percent}%
              </text>
            ) : (
              <polygon
                points="50,41 52.5,46.5 58.5,46.5 53.6,50.2 55.4,56 50,52.5 44.6,56 46.4,50.2 41.5,46.5 47.5,46.5"
                fill="#fbbf24"
              />
            )}
          </svg>

          {/* Huy hiệu lấp lánh góc */}
          <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-300 shadow-md">
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* THẺ HIỂN THỊ TRẠNG THÁI HOVER/NHẤN NHANH */}
        <div className="w-full text-center py-0.5 px-1 bg-slate-950/80 rounded-lg border border-slate-800 text-[8.5px] font-bold text-amber-300/90 truncate">
          {currentHoveredSector ? (
            <span style={{ color: currentHoveredSector.color }}>
              {currentHoveredSector.label}: {currentHoveredSector.percent}%
            </span>
          ) : (
            <span className="text-slate-400">Chạm miếng bánh để xem số liệu</span>
          )}
        </div>

        {/* CHÚ GIẢI CÁC MIẾNG BÁNH (CƠ CẤU 3 KHU VỰC KINH TẾ) */}
        <div className="w-full grid grid-cols-2 gap-1 mt-1.5 text-[9px] sm:text-[9.5px]">
          {ECONOMIC_PIE_SECTORS.map((sec) => {
            const isHovered = hoveredId === sec.id;
            return (
              <div
                key={sec.id}
                onMouseEnter={() => setHoveredId(sec.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  sound.playClick();
                  setActiveSector(sec);
                  setShowDetailModal(true);
                }}
                className={`flex items-center gap-1.5 p-1 rounded-lg border cursor-pointer transition-all ${
                  isHovered
                    ? 'bg-slate-900 border-amber-400 shadow-sm scale-102'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-amber-400/50 hover:bg-slate-900/60'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform"
                  style={{
                    backgroundColor: sec.color,
                    boxShadow: isHovered ? `0 0 6px ${sec.glow}` : 'none',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
                <div className="flex flex-col leading-tight truncate">
                  <span className="font-bold text-slate-200 truncate">{sec.shortLabel}</span>
                  <span className="font-black text-amber-300">{sec.percent}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TRIẾT LÝ PHÂN PHỐI CHIẾC BÁNH XÃ HỘI CHỦ NGHĨA */}
        <div
          onClick={() => {
            sound.playClick();
            setShowDetailModal(true);
          }}
          className="w-full mt-2 pt-1.5 border-t border-amber-500/30 text-center cursor-pointer group"
          title="Nhấn để xem luận điểm chấm điểm dành cho thầy cô"
        >
          <p className="text-[8.5px] sm:text-[9.5px] font-bold text-amber-200/90 leading-tight group-hover:text-amber-100 transition-colors flex items-center justify-center gap-1">
            <span>⚖️</span>
            <span>"Làm bánh to đi đôi với chia bánh công bằng"</span>
          </p>
          <span className="text-[7.5px] text-amber-400/70 font-semibold uppercase tracking-wider block mt-0.5">
            Nhấn mở luận điểm KTCT ❯
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL CHI TIẾT VỀ CHIẾC BÁNH KINH TẾ VIỆT NAM */}
      {/* (BÀI BÁO CÁO HỌC THUẬT HOÀN HẢO DÀNH CHO THẦY CÔ CHẤM ĐIỂM) */}
      {/* ======================================================== */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#241338] via-[#160c26] to-[#0c0617] border-3 border-amber-400/90 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(251,191,36,0.5)] max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b-2 border-amber-500/40 pb-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-3xl animate-bounce">🇻🇳</span>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-amber-200 uppercase tracking-wide flex items-center gap-2">
                    <span>CHIẾC BÁNH KINH TẾ VIỆT NAM</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-amber-200 border border-amber-400 font-bold">
                      NHÓM 2 • KTCT MÁC - LÊNIN
                    </span>
                  </h3>
                  <p className="text-xs text-amber-400/80 font-bold">
                    Quy mô GDP ~470 tỷ USD • Quan hệ Tăng trưởng & Phân phối XHCN
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung luận điểm chiếc bánh kinh tế */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-200">
              {/* Khối triết lý cốt lõi */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 shadow-inner">
                <h4 className="font-black text-amber-300 text-sm flex items-center gap-1.5 uppercase mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Luận Điểm Cốt Lõi: Tăng Trưởng ("Làm Bánh") & Phân Phối ("Chia Bánh")
                </h4>
                <p className="text-slate-200 leading-relaxed text-xs">
                  Trong <strong>Kinh tế Chính trị Mác - Lênin</strong> và mô hình <strong>Kinh tế thị trường định hướng Xã hội Chủ nghĩa</strong> tại Việt Nam, sự phát triển không chỉ dừng lại ở việc gia tăng kích thước chiếc bánh (tăng trưởng GDP), mà quan trọng nhất là <strong>nguyên tắc phân phối của cải xã hội</strong>: bảo đảm tiến bộ và công bằng xã hội trong từng bước đi, từng chính sách; <em>không hy sinh tiến bộ, công bằng xã hội và môi trường để chạy theo tăng trưởng kinh tế đơn thuần</em>.
                </p>
              </div>

              {/* 4 lát cắt chiếc bánh chi tiết */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ECONOMIC_PIE_SECTORS.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = activeSector?.id === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setActiveSector(sec)}
                      className={`p-3 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer space-y-1.5 shadow-md ${
                        isSelected ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800' : 'border-slate-700/80 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-sm"
                            style={{ backgroundColor: sec.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-black text-slate-100 text-xs sm:text-sm">
                            {sec.label}
                          </span>
                        </div>
                        <span
                          className="font-black text-sm px-2 py-0.5 rounded-full border border-black/30"
                          style={{ color: sec.color, backgroundColor: `${sec.color}25` }}
                        >
                          {sec.percent}%
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-normal">
                        <strong>Cơ cấu:</strong> {sec.desc}
                      </p>
                      <p className="text-[11px] text-amber-300/90 leading-normal">
                        <strong>Ý nghĩa thể chế:</strong> {sec.roleInXHCN}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Tóm tắt 4 thành phần kinh tế cùng làm bánh */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-[11px] space-y-1">
                <span className="font-bold text-amber-300 block uppercase">
                  4 Thành phần kinh tế cùng chung tay kiến tạo "Chiếc bánh" của cải:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  <li><strong>Kinh tế Nhà nước:</strong> Giữ vai trò chủ đạo, dẫn dắt các ngành chiến lược và hạ tầng kinh tế - xã hội then chốt.</li>
                  <li><strong>Kinh tế Tập thể, Hợp tác xã:</strong> Nền tảng liên kết bình đẳng, hỗ trợ tương thân tương ái giữa các thành viên.</li>
                  <li><strong>Kinh tế Tư nhân:</strong> Động lực quan trọng hàng đầu trong việc gia tăng sản lượng, tạo việc làm và giải phóng sức sản xuất.</li>
                  <li><strong>Kinh tế có vốn đầu tư nước ngoài (FDI):</strong> Đòn bẩy chuyển giao công nghệ cao, quản trị hiện đại và hội nhập chuỗi giá trị toàn cầu.</li>
                </ul>
              </div>

              {/* Kết luận học thuật của Nhóm 2 */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/70 to-slate-900 border border-red-500/40 text-[11px] text-red-200">
                <strong>📌 Lời Kết Nhóm 2:</strong> Bản chất ưu việt của mô hình Việt Nam là Nhà nước sử dụng công cụ pháp luật, quy hoạch và ngân sách để phân phối lại của cải công bằng, biến thành quả tăng trưởng kinh tế thành trường học, bệnh viện, mạng lưới an sinh xã hội cho toàn thể nhân dân.
              </div>
            </div>

            {/* Nút đóng */}
            <div className="mt-4 pt-3 border-t border-amber-500/30 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer transition-transform"
              >
                Đã Hiểu & Quay Lại Sảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
