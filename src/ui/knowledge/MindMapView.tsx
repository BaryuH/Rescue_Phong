import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Network,
} from 'lucide-react';
import { useProgress } from '../../systems/save';

interface MindNode {
  id: string;
  title: string;
  /** Câu chốt giúp nhớ cả nhánh (chỉ dùng cho node cành) */
  hook?: string;
  /** Từ khóa cô đọng — thứ cần nhớ khi ôn nhanh */
  keys?: string[];
  cardId?: string;
  source?: string;
  children?: MindNode[];
}

/**
 * Cây tri thức Chương 5 — mỗi lá là một thẻ bài học, mỗi cành có câu chốt ghi nhớ.
 * Toàn bộ từ khóa rút gọn từ docs/Phần_kiến_thức_chính.md (mục II và III).
 */
const MINDMAP_TREE: MindNode = {
  id: 'root',
  title: 'CHƯƠNG 5',
  hook: 'Thể chế tạo luật chơi — Lợi ích tạo động lực',
  keys: ['II · Thể chế KTTT', 'III · Quan hệ lợi ích'],
  children: [
    {
      id: 'branch_ii',
      title: 'II. Hoàn thiện thể chế KTTT định hướng XHCN',
      hook: 'Luật chơi → Người chơi → Cách chơi',
      children: [
        {
          id: 'ii_1',
          title: '1. Vì sao phải hoàn thiện?',
          hook: '3 lý do: CHƯA ĐỒNG BỘ — CHƯA ĐẦY ĐỦ — KÉM HIỆU LỰC',
          children: [
            {
              id: 'ii_1_a',
              title: 'a) Thể chế & thể chế kinh tế',
              hook: 'Nhớ 4 chữ: Quy tắc — Luật pháp — Bộ máy — Cơ chế',
              children: [
                {
                  id: 'c1',
                  title: 'Khái niệm thể chế',
                  keys: ['Quy tắc', 'Luật pháp', 'Bộ máy quản lý', 'Cơ chế vận hành'],
                  cardId: 'card-01',
                  source: 'II.1.a.the-che',
                },
                {
                  id: 'c2',
                  title: 'Thể chế kinh tế — 3 bộ phận',
                  keys: ['① Pháp luật kinh tế', '② Chủ thể kinh tế', '③ Cơ chế – thủ tục'],
                  cardId: 'card-02',
                  source: 'II.1.a.the-che-kinh-te',
                },
              ],
            },
            {
              id: 'ii_1_b',
              title: 'b) Ba lý do khách quan',
              hook: 'Chưa đồng bộ → chưa đầy đủ → kém hiệu lực',
              children: [
                {
                  id: 'c3',
                  title: 'Khái niệm & lý do 1',
                  keys: ['Chưa đồng bộ', 'Dân giàu – nước mạnh – dân chủ – công bằng – văn minh'],
                  cardId: 'card-03',
                  source: 'II.1.b',
                },
                {
                  id: 'c4',
                  title: 'Lý do 2 & 3',
                  keys: ['Chưa đầy đủ', 'Kém hiệu lực, hiệu quả', 'Nhà nước là tác giả thể chế'],
                  cardId: 'card-04',
                  source: 'II.1.b',
                },
                {
                  id: 'c5',
                  title: 'Hộp 5.2 — hạn chế (1)',
                  keys: ['Làm còn chậm', 'Chồng chéo, thiếu nhất quán', 'Lợi ích cục bộ'],
                  cardId: 'card-05',
                  source: 'II.1.b',
                },
                {
                  id: 'c6',
                  title: 'Hộp 5.2 — hạn chế (2)',
                  keys: ['Thị trường chậm hình thành', 'Phân hóa giàu – nghèo', 'Đổi mới lãnh đạo chưa kịp'],
                  cardId: 'card-06',
                  source: 'II.1.b',
                },
              ],
            },
          ],
        },
        {
          id: 'ii_2',
          title: '2. Nội dung hoàn thiện (5 nhóm)',
          hook: 'SỞ HỮU — THÀNH PHẦN — THỊ TRƯỜNG — BỀN VỮNG — LÃNH ĐẠO',
          children: [
            {
              id: 'ii_2_a1',
              title: 'a₁) Thể chế về sở hữu',
              hook: 'Tài sản rõ chủ thì nguồn lực mới chảy',
              children: [
                {
                  id: 'c7',
                  title: 'Quyền tài sản & tài nguyên',
                  keys: ['Sở hữu – sử dụng – định đoạt – hưởng lợi', 'Pháp luật đất đai', 'Tài sản công'],
                  cardId: 'card-07',
                  source: 'II.2.a.hoan-thien-the-che-ve-so',
                },
                {
                  id: 'c8',
                  title: 'Sở hữu trí tuệ & quản trị quốc gia',
                  keys: ['Bảo hộ sáng tạo', 'Hợp đồng & tranh chấp', 'Quản trị quốc gia (ĐH XIII)'],
                  cardId: 'card-08',
                  source: 'II.2.a.hoan-thien-the-che-ve-so',
                },
              ],
            },
            {
              id: 'ii_2_a2',
              title: 'a₂) Thành phần kinh tế & doanh nghiệp',
              hook: 'Một sân chơi — nhiều người chơi — bình đẳng',
              children: [
                {
                  id: 'c9',
                  title: 'Bình đẳng & cạnh tranh',
                  keys: ['1 chế độ pháp lý kinh doanh', 'Tự do kinh doanh', 'Đấu thầu minh bạch'],
                  cardId: 'card-09',
                  source: 'II.2.a.hoan-thien-the-che-phat-trien',
                },
                {
                  id: 'c10',
                  title: 'DNNN, đơn vị sự nghiệp & kinh tế tập thể',
                  keys: ['DNNN: lĩnh vực then chốt', 'Quản chặt vốn nhà nước', 'Đổi mới hợp tác xã'],
                  cardId: 'card-10',
                  source: 'II.2.a.hoan-thien-the-che-phat-trien',
                },
                {
                  id: 'c11',
                  title: 'Kinh tế tư nhân & FDI',
                  keys: ['Tư nhân = động lực quan trọng', 'Hỗ trợ DN nhỏ và vừa', 'FDI có chọn lọc'],
                  cardId: 'card-11',
                  source: 'II.2.a.hoan-thien-the-che-phat-trien',
                },
              ],
            },
            {
              id: 'ii_2_b',
              title: 'b) Yếu tố & các loại thị trường',
              children: [
                {
                  id: 'c12',
                  title: 'Đồng bộ & thông suốt',
                  keys: ['Giá – cạnh tranh – cung cầu', 'Thị trường vốn, KHCN, đất, lao động'],
                  cardId: 'card-12',
                  source: 'II.2.b',
                },
              ],
            },
            {
              id: 'ii_2_c',
              title: 'c) Bền vững & hội nhập',
              children: [
                {
                  id: 'c13',
                  title: 'Tăng trưởng gắn công bằng',
                  keys: ['Nhanh + bền vững', 'Thụ hưởng công bằng', '2 nhiệm vụ hội nhập'],
                  cardId: 'card-13',
                  source: 'II.2.c',
                },
              ],
            },
            {
              id: 'ii_2_d',
              title: 'd) Đảng & hệ thống chính trị',
              children: [
                {
                  id: 'c14',
                  title: 'Ba vai trò trụ cột',
                  keys: ['Đảng lãnh đạo', 'Nhà nước quản lý', 'Nhân dân làm chủ'],
                  cardId: 'card-14',
                  source: 'II.2.d',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'branch_iii',
      title: 'III. Các quan hệ lợi ích kinh tế ở Việt Nam',
      hook: 'Lợi ích là động lực — Quan hệ vừa thống nhất vừa mâu thuẫn',
      children: [
        {
          id: 'iii_1',
          title: '1. Lợi ích kinh tế',
          hook: 'Khái niệm → Bản chất → Biểu hiện → Vai trò',
          children: [
            {
              id: 'c15',
              title: 'Mục tiêu nghiên cứu',
              keys: ['Lý luận quan hệ lợi ích', 'Kỹ năng bảo vệ lợi ích chính đáng'],
              cardId: 'card-15',
              source: 'III',
            },
            {
              id: 'c16',
              title: 'Khái niệm lợi ích kinh tế',
              keys: ['Thỏa mãn nhu cầu', 'Lợi ích vật chất quyết định'],
              cardId: 'card-16',
              source: 'III.1.a.khai-niem-loi-ich-kinh-te',
            },
            {
              id: 'c17',
              title: 'Bản chất',
              keys: ['Mục đích & động cơ', 'Ăngghen: quan hệ kinh tế biểu hiện dưới hình thức lợi ích'],
              cardId: 'card-17',
              source: 'III.1.a.ban-chat-va-bieu-hien-cua',
            },
            {
              id: 'c18',
              title: 'Biểu hiện',
              keys: ['Chủ doanh nghiệp → lợi nhuận', 'Người lao động → tiền lương, thu nhập'],
              cardId: 'card-18',
              source: 'III.1.a.ban-chat-va-bieu-hien-cua',
            },
            {
              id: 'c19',
              title: 'Vai trò 1 — động lực trực tiếp',
              keys: ['Thu nhập ↑ → thỏa mãn ↑', 'Thôi thúc sáng tạo'],
              cardId: 'card-19',
              source: 'III.1.a.vai-tro-cua-loi-ich-kinh',
            },
            {
              id: 'c20',
              title: 'Vai trò 2 — cơ sở các lợi ích khác',
              keys: ['Nền cho lợi ích chính trị, văn hóa, xã hội', '"Dân là gốc"'],
              cardId: 'card-20',
              source: 'III.1.a.vai-tro-cua-loi-ich-kinh',
            },
          ],
        },
        {
          id: 'iii_2',
          title: '2. Quan hệ lợi ích kinh tế',
          hook: '2 mặt — 4 nhân tố — 6 quan hệ — 2 phương thức',
          children: [
            {
              id: 'iii_2_a',
              title: 'Khái niệm & hai mặt',
              hook: 'Vừa thống nhất, vừa mâu thuẫn — Nhà nước điều hòa',
              children: [
                {
                  id: 'c21',
                  title: 'Khái niệm quan hệ lợi ích',
                  keys: ['Chiều dọc', 'Chiều ngang', 'Quốc gia ↔ thế giới'],
                  cardId: 'card-21',
                  source: 'III.1.b.khai-niem-quan-he-loi-ich',
                },
                {
                  id: 'c22',
                  title: 'Mặt thống nhất',
                  keys: ['Chủ thể là bộ phận của nhau', 'DN hiệu quả → lao động ổn định'],
                  cardId: 'card-22',
                  source: 'III.1.b.su-thong-nhat-va-mau-thuan',
                },
                {
                  id: 'c23',
                  title: 'Mặt mâu thuẫn',
                  keys: ['Phương thức đối lập', 'Hàng giả, trốn thuế', 'Chia kết quả sản xuất'],
                  cardId: 'card-23',
                  source: 'III.1.b.su-thong-nhat-va-mau-thuan',
                },
                {
                  id: 'c24',
                  title: 'Điều hòa & nền tảng',
                  keys: ['Nhà nước điều hòa', 'Lợi ích cá nhân là cơ sở'],
                  cardId: 'card-24',
                  source: 'III.1.b.su-thong-nhat-va-mau-thuan',
                },
              ],
            },
            {
              id: 'iii_2_b',
              title: '4 nhân tố ảnh hưởng',
              hook: 'LLSX — QHSX — Phân phối — Hội nhập',
              children: [
                {
                  id: 'c25',
                  title: 'Nhân tố 1 & 2',
                  keys: ['Trình độ lực lượng sản xuất', 'Địa vị trong quan hệ sản xuất'],
                  cardId: 'card-25',
                  source: 'III.1.b.cac-nhan-to-anh-huong-den',
                },
                {
                  id: 'c26',
                  title: 'Nhân tố 3 & 4',
                  keys: ['Chính sách phân phối thu nhập', 'Hội nhập kinh tế quốc tế'],
                  cardId: 'card-26',
                  source: 'III.1.b.cac-nhan-to-anh-huong-den',
                },
              ],
            },
            {
              id: 'iii_2_c',
              title: 'Các quan hệ lợi ích cơ bản',
              hook: 'LĐ ↔ chủ · chủ ↔ chủ · LĐ ↔ LĐ · cá nhân ↔ xã hội · nhóm',
              children: [
                {
                  id: 'c27',
                  title: 'Người LĐ ↔ người sử dụng LĐ',
                  keys: ['Tiền lương = giá cả sức lao động', 'Thống nhất khi DN thuận lợi'],
                  cardId: 'card-27',
                  source: 'III.1.b.mot-so-quan-he-loi-ich',
                },
                {
                  id: 'c28',
                  title: 'Mâu thuẫn & tổ chức đại diện',
                  keys: ['Lương ↑ ⇄ lợi nhuận ↓', 'Công đoàn', 'Nghiệp đoàn giới chủ'],
                  cardId: 'card-28',
                  source: 'III.1.b.mot-so-quan-he-loi-ich',
                },
                {
                  id: 'c29',
                  title: 'Giữa những người sử dụng LĐ',
                  keys: ['Vừa đối tác vừa đối thủ', 'Tỷ suất lợi nhuận bình quân', 'Đội ngũ doanh nhân'],
                  cardId: 'card-29',
                  source: 'III.1.b.mot-so-quan-he-loi-ich',
                },
                {
                  id: 'c30',
                  title: 'Giữa những người lao động',
                  keys: ['Cạnh tranh → ép lương', 'Đoàn kết → yêu sách chính đáng'],
                  cardId: 'card-30',
                  source: 'III.1.b.mot-so-quan-he-loi-ich',
                },
                {
                  id: 'c31',
                  title: 'Cá nhân ↔ xã hội',
                  keys: ['Làm đúng luật = đóng góp xã hội', 'Xã hội định hướng cá nhân'],
                  cardId: 'card-31',
                  source: 'III.1.b.mot-so-quan-he-loi-ich',
                },
                {
                  id: 'c32',
                  title: 'Lợi ích nhóm & nhóm lợi ích',
                  keys: ['Cùng ngành = lợi ích nhóm', 'Khác ngành = nhóm lợi ích', 'Chống tiêu cực, tham nhũng'],
                  cardId: 'card-32',
                  source: 'III.1.b.mot-so-quan-he-loi-ich',
                },
              ],
            },
            {
              id: 'iii_2_d',
              title: '2 phương thức thực hiện',
              children: [
                {
                  id: 'c33',
                  title: 'Thị trường & Nhà nước',
                  keys: ['① Nguyên tắc thị trường', '② Chính sách nhà nước & tổ chức xã hội'],
                  cardId: 'card-33',
                  source: 'III.1.b.phuong-thuc-thuc-hien-loi-ich',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** Bảng màu theo độ sâu — giữ cây dễ đọc mà không rối mắt */
const DEPTH_STYLE = [
  'from-indigo-600/25 to-indigo-500/5 border-indigo-400/70 text-indigo-100',
  'from-emerald-600/25 to-emerald-500/5 border-emerald-400/70 text-emerald-100',
  'from-amber-600/20 to-amber-500/5 border-amber-400/60 text-amber-100',
  'from-sky-600/15 to-sky-500/5 border-sky-400/50 text-sky-100',
];

const collectLeaves = (node: MindNode, out: MindNode[] = []): MindNode[] => {
  if (node.cardId) out.push(node);
  node.children?.forEach((c) => collectLeaves(c, out));
  return out;
};

const collectBranchIds = (node: MindNode, out: string[] = []): string[] => {
  if (node.children?.length) {
    out.push(node.id);
    node.children.forEach((c) => collectBranchIds(c, out));
  }
  return out;
};

interface Props {
  onSelectCard: (cardId: string) => void;
}

export const MindMapView: React.FC<Props> = ({ onSelectCard }) => {
  const [progress] = useProgress();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);

  const allLeaves = useMemo(() => collectLeaves(MINDMAP_TREE), []);
  const allBranches = useMemo(() => collectBranchIds(MINDMAP_TREE), []);
  const learnedCount = allLeaves.filter(
    (l) => l.cardId && progress.learnedCards.includes(l.cardId)
  ).length;

  const toggle = (id: string) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));
  const expandAll = () => setCollapsed({});
  const collapseAll = () =>
    setCollapsed(Object.fromEntries(allBranches.filter((id) => id !== 'root').map((id) => [id, true])));

  const renderNode = (node: MindNode, depth: number): React.ReactNode => {
    const children = node.children ?? [];
    const isBranch = children.length > 0;
    const isOpen = !collapsed[node.id];
    const learned = node.cardId ? progress.learnedCards.includes(node.cardId) : false;
    const style = DEPTH_STYLE[Math.min(depth, DEPTH_STYLE.length - 1)];

    // Thống kê tiến độ của cả nhánh
    const leaves = isBranch ? collectLeaves(node) : [];
    const leafDone = leaves.filter(
      (l) => l.cardId && progress.learnedCards.includes(l.cardId)
    ).length;

    return (
      <li
        key={node.id}
        className={
          depth === 0
            ? 'relative'
            : `relative pl-7
               before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-slate-700
               last:before:h-[26px]
               after:absolute after:left-0 after:top-[26px] after:h-px after:w-7 after:bg-slate-700`
        }
      >
        <div className="flex items-start gap-1.5 py-1">
          {isBranch ? (
            <button
              onClick={() => toggle(node.id)}
              aria-label={isOpen ? 'Thu gọn nhánh' : 'Mở nhánh'}
              className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:border-slate-500 hover:text-white cursor-pointer"
            >
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="mt-[15px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          )}

          <div
            onClick={() => (isBranch ? toggle(node.id) : node.cardId && onSelectCard(node.cardId))}
            className={`group max-w-[560px] cursor-pointer rounded-xl border bg-gradient-to-br px-3 py-2 shadow-sm transition-all hover:brightness-125 ${
              isBranch
                ? style
                : learned
                  ? 'border-emerald-500/80 from-emerald-600/20 to-emerald-500/5 text-emerald-50'
                  : 'border-slate-700 from-slate-800/80 to-slate-900 text-slate-200 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {!isBranch && learned && (
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              )}
              <span
                className={
                  depth === 0
                    ? 'text-sm font-black tracking-wide'
                    : depth === 1
                      ? 'text-[13px] font-black'
                      : 'text-xs font-bold'
                }
              >
                {node.title}
              </span>

              {isBranch && (
                <span className="ml-auto shrink-0 rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] font-black tabular-nums text-slate-300">
                  {leafDone}/{leaves.length}
                </span>
              )}

              {!isBranch && (
                <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-emerald-400/60 transition-opacity group-hover:opacity-100" />
              )}
            </div>

            {node.hook && (
              <p className="mt-1 text-[10.5px] font-semibold italic text-slate-300/90">
                💡 {node.hook}
              </p>
            )}

            {node.keys && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {node.keys.map((k) => (
                  <span
                    key={k}
                    className="rounded-md border border-slate-700/80 bg-slate-950/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}

            {node.source && (
              <span className="mt-1.5 inline-block font-mono text-[9px] text-slate-500">
                {node.source}
              </span>
            )}
          </div>
        </div>

        {isBranch && isOpen && <ul className="relative">{children.map((c) => renderNode(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Thanh công cụ */}
      <div className="z-10 flex h-12 flex-shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Network className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="truncate text-xs font-bold text-slate-200">
            Cây tri thức Chương 5 — nhấp vào lá để mở bài học
          </span>
          <span className="hidden shrink-0 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black text-emerald-300 sm:inline">
            {learnedCount}/{allLeaves.length} thẻ đã học
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={expandAll}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] font-bold text-slate-300 transition-colors hover:text-white cursor-pointer"
          >
            Mở tất cả
          </button>
          <button
            onClick={collapseAll}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] font-bold text-slate-300 transition-colors hover:text-white cursor-pointer"
          >
            Thu gọn
          </button>

          <div className="ml-1 flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="cursor-pointer rounded-lg bg-slate-900 p-1 text-slate-400 hover:bg-slate-800"
              title="Thu nhỏ"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[10px] text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="cursor-pointer rounded-lg bg-slate-900 p-1 text-slate-400 hover:bg-slate-800"
              title="Phóng to"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="cursor-pointer rounded-lg bg-slate-900 p-1 text-slate-400 hover:bg-slate-800"
              title="Mặc định"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Khung cây */}
      <div className="no-scrollbar flex-1 overflow-auto p-5 sm:p-8">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          className="inline-block min-w-max transition-transform duration-150"
        >
          <ul>{renderNode(MINDMAP_TREE, 0)}</ul>
        </div>
      </div>
    </div>
  );
};
