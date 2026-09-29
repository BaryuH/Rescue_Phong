import React, { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { useProgress } from '../../systems/save';

interface MindNode {
  id: string;
  title: string;
  cardId?: string;
  source?: string;
  children?: MindNode[];
}

const MINDMAP_TREE: MindNode = {
  id: 'root',
  title: 'CHƯƠNG 5: KTTT ĐỊNH HƯỚNG XHCN VÀ CÁC QUAN HỆ LỢI ÍCH KINH TẾ Ở VIỆT NAM',
  children: [
    {
      id: 'branch_ii',
      title: 'II. Hoàn Thiện Thể Chế KTTT Định Hướng XHCN',
      children: [
        {
          id: 'branch_ii_1',
          title: '1. Sự Cần Thiết Phải Hoàn Thiện Thể Chế',
          children: [
            {
              id: 'node_ii_1_a',
              title: 'a) Thể chế và thể chế kinh tế',
              children: [
                { id: 'c1', title: 'Khái niệm thể chế', cardId: 'card-01', source: 'II.1.a.the-che' },
                { id: 'c2', title: 'Thể chế kinh tế & 3 bộ phận', cardId: 'card-02', source: 'II.1.a.the-che-kinh-te' },
              ],
            },
            {
              id: 'node_ii_1_b',
              title: 'b) Thể chế KTTT XHCN & 3 lý do hoàn thiện',
              children: [
                { id: 'c3', title: 'Khái niệm & Yêu cầu đồng bộ', cardId: 'card-03', source: 'II.1.b' },
                { id: 'c4', title: 'Chưa đầy đủ & Kém hiệu lực', cardId: 'card-04', source: 'II.1.b' },
                { id: 'c5', title: 'Hạn chế thực tế (Hộp 5.2 - P1)', cardId: 'card-05', source: 'II.1.b' },
                { id: 'c6', title: 'Hạn chế thực tế (Hộp 5.2 - P2)', cardId: 'card-06', source: 'II.1.b' },
              ],
            },
          ],
        },
        {
          id: 'branch_ii_2',
          title: '2. Nội Dung Hoàn Thiện Thể Chế',
          children: [
            {
              id: 'node_ii_2_a_sohuu',
              title: 'a.1) Thể chế về sở hữu',
              children: [
                { id: 'c7', title: 'Quyền tài sản & Tài nguyên', cardId: 'card-07', source: 'II.2.a.hoan-thien-the-che-ve-so' },
                { id: 'c8', title: 'Sở hữu trí tuệ & Quản trị QG', cardId: 'card-08', source: 'II.2.a.hoan-thien-the-che-ve-so' },
              ],
            },
            {
              id: 'node_ii_2_a_tpkt',
              title: 'a.2) Phát triển các thành phần kinh tế & DN',
              children: [
                { id: 'c9', title: 'Bình đẳng & Tự do kinh doanh', cardId: 'card-09', source: 'II.2.a.hoan-thien-the-che-phat-trien' },
                { id: 'c10', title: 'Đổi mới DNNN & Kinh tế tập thể', cardId: 'card-10', source: 'II.2.a.hoan-thien-the-che-phat-trien' },
                { id: 'c11', title: 'Kinh tế tư nhân & Thu hút FDI', cardId: 'card-11', source: 'II.2.a.hoan-thien-the-che-phat-trien' },
              ],
            },
            {
              id: 'node_ii_2_b',
              title: 'b) Yếu tố & các loại thị trường',
              children: [
                { id: 'c12', title: 'Vận hành đồng bộ các thị trường', cardId: 'card-12', source: 'II.2.b' },
              ],
            },
            {
              id: 'node_ii_2_c',
              title: 'c) Tăng trưởng bền vững & Hội nhập',
              children: [
                { id: 'c13', title: 'Công bằng xã hội & Đa phương hóa', cardId: 'card-13', source: 'II.2.c' },
              ],
            },
            {
              id: 'node_ii_2_d',
              title: 'd) Lãnh đạo của Đảng & HTCT',
              children: [
                { id: 'c14', title: 'Năng lực lãnh đạo & Làm chủ', cardId: 'card-14', source: 'II.2.d' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'branch_iii',
      title: 'III. Các Quan Hệ Lợi Ích Kinh Tế Ở Việt Nam',
      children: [
        {
          id: 'branch_iii_1',
          title: '1. Lợi Ích Kinh Tế & Bản Chất',
          children: [
            {
              id: 'node_iii_1_a_kn',
              title: 'a) Khái niệm, bản chất & vai trò',
              children: [
                { id: 'c15', title: 'Mục tiêu nghiên cứu quan hệ lợi ích', cardId: 'card-15', source: 'III' },
                { id: 'c16', title: 'Khái niệm Lợi ích kinh tế', cardId: 'card-16', source: 'III.1.a.khai-niem-loi-ich-kinh-te' },
                { id: 'c17', title: 'Bản chất của lợi ích kinh tế', cardId: 'card-17', source: 'III.1.a.ban-chat-va-bieu-hien-cua' },
                { id: 'c18', title: 'Biểu hiện của lợi ích kinh tế', cardId: 'card-18', source: 'III.1.a.ban-chat-va-bieu-hien-cua' },
                { id: 'c19', title: 'Động lực trực tiếp phát triển', cardId: 'card-19', source: 'III.1.a.vai-tro-cua-loi-ich-kinh' },
                { id: 'c20', title: 'Cơ sở lợi ích khác & Dân là gốc', cardId: 'card-20', source: 'III.1.a.vai-tro-cua-loi-ich-kinh' },
              ],
            },
          ],
        },
        {
          id: 'branch_iii_2',
          title: '2. Quan Hệ Lợi Ích Kinh Tế & Phương Thức',
          children: [
            {
              id: 'node_iii_1_b_qh',
              title: 'b) Quan hệ lợi ích & Các chủ thể',
              children: [
                { id: 'c21', title: 'Khái niệm quan hệ lợi ích', cardId: 'card-21', source: 'III.1.b.khai-niem-quan-he-loi-ich' },
                { id: 'c22', title: 'Sự thống nhất trong lợi ích', cardId: 'card-22', source: 'III.1.b.su-thong-nhat-va-mau-thuan' },
                { id: 'c23', title: 'Sự mâu thuẫn trong lợi ích', cardId: 'card-23', source: 'III.1.b.su-thong-nhat-va-mau-thuan' },
                { id: 'c24', title: 'Điều hòa & Lợi ích cá nhân nền tảng', cardId: 'card-24', source: 'III.1.b.su-thong-nhat-va-mau-thuan' },
                { id: 'c25', title: 'Nhân tố LLSX và QHSX', cardId: 'card-25', source: 'III.1.b.cac-nhan-to-anh-huong-den' },
                { id: 'c26', title: 'Nhân tố Phân phối & Hội nhập', cardId: 'card-26', source: 'III.1.b.cac-nhan-to-anh-huong-den' },
                { id: 'c27', title: 'Người LĐ & Người sử dụng LĐ (P1)', cardId: 'card-27', source: 'III.1.b.mot-so-quan-he-loi-ich' },
                { id: 'c28', title: 'Mâu thuẫn & Tổ chức đại diện (P2)', cardId: 'card-28', source: 'III.1.b.mot-so-quan-he-loi-ich' },
                { id: 'c29', title: 'Quan hệ giữa người sử dụng LĐ', cardId: 'card-29', source: 'III.1.b.mot-so-quan-he-loi-ich' },
                { id: 'c30', title: 'Quan hệ giữa những người LĐ', cardId: 'card-30', source: 'III.1.b.mot-so-quan-he-loi-ich' },
                { id: 'c31', title: 'Lợi ích cá nhân & Lợi ích xã hội', cardId: 'card-31', source: 'III.1.b.mot-so-quan-he-loi-ich' },
                { id: 'c32', title: 'Lợi ích nhóm & Chống tiêu cực', cardId: 'card-32', source: 'III.1.b.mot-so-quan-he-loi-ich' },
                { id: 'c33', title: 'Hai phương thức thực hiện lợi ích', cardId: 'card-33', source: 'III.1.b.phuong-thuc-thuc-hien-loi-ich' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

interface Props {
  onSelectCard: (cardId: string) => void;
}

export const MindMapView: React.FC<Props> = ({ onSelectCard }) => {
  const [progress] = useProgress();
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);

  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderNode = (node: MindNode, level: number = 0) => {
    const isLeaf = !node.children || node.children.length === 0;
    const isCollapsed = !!collapsedNodes[node.id];
    const isLearned = node.cardId ? progress.learnedCards.includes(node.cardId) : false;

    // Màu sắc theo độ sâu phân cấp
    const levelColors = [
      'bg-indigo-950 border-indigo-500 text-indigo-200',      // Root
      'bg-emerald-950 border-emerald-500 text-emerald-200',    // Chương lớn
      'bg-amber-950/80 border-amber-500 text-amber-200',       // Mục lớn
      'bg-slate-900 border-slate-700 text-slate-200',          // Mục nhỏ
    ];

    const colorClass = levelColors[Math.min(level, levelColors.length - 1)];

    return (
      <div key={node.id} className="relative flex flex-col items-start my-1.5 ml-4 sm:ml-6">
        {/* Đường nối nhánh */}
        <div className="flex items-center gap-2">
          {/* Nút bấm toggle hoặc icon leaf */}
          {!isLeaf ? (
            <button
              onClick={() => toggleCollapse(node.id)}
              className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer border border-slate-700 flex-shrink-0"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          )}

          {/* Hộp node */}
          <div
            onClick={() => {
              if (isLeaf && node.cardId) {
                onSelectCard(node.cardId);
              } else if (!isLeaf) {
                toggleCollapse(node.id);
              }
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 select-none shadow-sm ${colorClass} ${
              isLeaf
                ? isLearned
                  ? 'border-emerald-500 ring-1 ring-emerald-500/50 hover:bg-emerald-900/40'
                  : 'opacity-70 hover:opacity-100 hover:border-slate-500'
                : 'hover:scale-[1.01]'
            }`}
          >
            {isLeaf && isLearned && (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            )}

            <span className={`text-xs ${level === 0 ? 'font-black text-sm' : 'font-bold'}`}>
              {node.title}
            </span>

            {node.source && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-400 border border-slate-700/60 ml-1">
                {node.source}
              </span>
            )}

            {isLeaf && node.cardId && (
              <ExternalLink className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 ml-1" />
            )}
          </div>
        </div>

        {/* Các nhánh con */}
        {!isLeaf && !isCollapsed && (
          <div className="border-l-2 border-slate-800/80 pl-2 mt-1">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Controls Toolbar */}
      <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            Sơ Đồ Mạng Lưới Kiến Thức (Nhấp vào nhánh lá để mở bài học)
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] text-slate-300 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 cursor-pointer"
            title="Mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mindmap Canvas Area */}
      <div className="flex-1 overflow-auto p-6 sm:p-10 no-scrollbar">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          className="transition-transform duration-150 inline-block min-w-max"
        >
          {renderNode(MINDMAP_TREE)}
        </div>
      </div>
    </div>
  );
};
