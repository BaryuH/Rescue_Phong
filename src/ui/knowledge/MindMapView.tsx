import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, ZoomIn, ZoomOut, RotateCcw, Search, Network } from 'lucide-react';
import { useProgress } from '../../systems/save';

interface Leaf {
  id: string;
  icon: string;
  title: string;
  /** Tri thức cô đọng — đọc lướt là nhớ */
  keys: string[];
  /** Nhãn phân loại ngắn, in hoa */
  tag: string;
  cardId: string;
  source: string;
}

interface Column {
  id: string;
  title: string;
  /** Câu chốt ghi nhớ cả cột */
  hook: string;
  leaves: Leaf[];
}

interface Branch {
  id: string;
  badge: string;
  title: string;
  hook: string;
  /** hex accent dùng cho viền, badge, đường nối */
  accent: string;
  columns: Column[];
}

/**
 * Cây tri thức Chương 5 — bố cục top-down: gốc → 2 phần lớn → 6 cột → 33 thẻ lá.
 * Mọi từ khóa rút gọn từ docs/Phần_kiến_thức_chính.md (mục II và III).
 */
const ROOT_TITLE = 'CHƯƠNG 5: KTTT ĐỊNH HƯỚNG XHCN & CÁC QUAN HỆ LỢI ÍCH KINH TẾ';
const ROOT_HOOK = 'Thể chế tạo luật chơi — Lợi ích tạo động lực';

const BRANCHES: Branch[] = [
  {
    id: 'ii',
    badge: 'PHẦN II',
    title: 'HOÀN THIỆN THỂ CHẾ KTTT ĐỊNH HƯỚNG XHCN',
    hook: 'Luật chơi → Người chơi → Cách chơi',
    accent: '#34d399',
    columns: [
      {
        id: 'ii_1',
        title: '1. Vì sao phải hoàn thiện?',
        hook: '3 lý do: CHƯA ĐỒNG BỘ — CHƯA ĐẦY ĐỦ — KÉM HIỆU LỰC',
        leaves: [
          {
            id: 'c1',
            icon: '⚖️',
            title: 'Khái niệm Thể chế',
            keys: ['Quy tắc', 'Luật pháp', 'Bộ máy', 'Cơ chế'],
            tag: 'KHÁI NIỆM',
            cardId: 'card-01',
            source: 'II.1.a.the-che',
          },
          {
            id: 'c2',
            icon: '🧩',
            title: 'Thể chế kinh tế — 3 bộ phận',
            keys: ['Pháp luật kinh tế', 'Chủ thể kinh tế', 'Cơ chế – thủ tục'],
            tag: '3 BỘ PHẬN',
            cardId: 'card-02',
            source: 'II.1.a.the-che-kinh-te',
          },
          {
            id: 'c3',
            icon: '🏛️',
            title: 'Khái niệm & Lý do 1',
            keys: ['Chưa đồng bộ', 'Dân giàu, nước mạnh, dân chủ, công bằng, văn minh'],
            tag: 'LÝ DO 1',
            cardId: 'card-03',
            source: 'II.1.b',
          },
          {
            id: 'c4',
            icon: '🧱',
            title: 'Lý do 2 & 3',
            keys: ['Chưa đầy đủ', 'Kém hiệu lực', 'Nhà nước là tác giả thể chế'],
            tag: 'LÝ DO 2–3',
            cardId: 'card-04',
            source: 'II.1.b',
          },
          {
            id: 'c5',
            icon: '📌',
            title: 'Hộp 5.2 — Hạn chế (1)',
            keys: ['Làm còn chậm', 'Chồng chéo', 'Lợi ích cục bộ'],
            tag: 'HẠN CHẾ',
            cardId: 'card-05',
            source: 'II.1.b',
          },
          {
            id: 'c6',
            icon: '📉',
            title: 'Hộp 5.2 — Hạn chế (2)',
            keys: ['Thị trường chậm', 'Phân hóa giàu – nghèo', 'Lãnh đạo chưa kịp'],
            tag: 'HẠN CHẾ',
            cardId: 'card-06',
            source: 'II.1.b',
          },
        ],
      },
      {
        id: 'ii_2a',
        title: '2a. Sở hữu & Thành phần kinh tế',
        hook: 'Tài sản rõ chủ — sân chơi bình đẳng',
        leaves: [
          {
            id: 'c7',
            icon: '🔑',
            title: 'Quyền tài sản & Tài nguyên',
            keys: ['Sở hữu – sử dụng – định đoạt – hưởng lợi', 'Đất đai', 'Tài sản công'],
            tag: 'SỞ HỮU',
            cardId: 'card-07',
            source: 'II.2.a.hoan-thien-the-che-ve-so',
          },
          {
            id: 'c8',
            icon: '💡',
            title: 'Sở hữu trí tuệ & Quản trị QG',
            keys: ['Bảo hộ sáng tạo', 'Hợp đồng', 'Quản trị quốc gia'],
            tag: 'SỞ HỮU',
            cardId: 'card-08',
            source: 'II.2.a.hoan-thien-the-che-ve-so',
          },
          {
            id: 'c9',
            icon: '🤝',
            title: 'Bình đẳng & Cạnh tranh',
            keys: ['1 chế độ pháp lý', 'Tự do kinh doanh', 'Đấu thầu minh bạch'],
            tag: 'BÌNH ĐẲNG',
            cardId: 'card-09',
            source: 'II.2.a.hoan-thien-the-che-phat-trien',
          },
          {
            id: 'c10',
            icon: '🏢',
            title: 'DNNN & Kinh tế tập thể',
            keys: ['DNNN: lĩnh vực then chốt', 'Quản chặt vốn nhà nước', 'Hợp tác xã'],
            tag: 'DOANH NGHIỆP',
            cardId: 'card-10',
            source: 'II.2.a.hoan-thien-the-che-phat-trien',
          },
          {
            id: 'c11',
            icon: '🚀',
            title: 'Kinh tế tư nhân & FDI',
            keys: ['Tư nhân = động lực quan trọng', 'DN nhỏ và vừa', 'FDI có chọn lọc'],
            tag: 'TƯ NHÂN & FDI',
            cardId: 'card-11',
            source: 'II.2.a.hoan-thien-the-che-phat-trien',
          },
        ],
      },
      {
        id: 'ii_2b',
        title: '2b. Thị trường · Bền vững · Lãnh đạo',
        hook: 'Thị trường đồng bộ — tăng trưởng công bằng — Đảng lãnh đạo',
        leaves: [
          {
            id: 'c12',
            icon: '📊',
            title: 'Yếu tố & các loại thị trường',
            keys: ['Giá – cạnh tranh – cung cầu', 'Vốn, KHCN, đất, lao động'],
            tag: 'THỊ TRƯỜNG',
            cardId: 'card-12',
            source: 'II.2.b',
          },
          {
            id: 'c13',
            icon: '🌏',
            title: 'Bền vững & Hội nhập',
            keys: ['Nhanh + bền vững', 'Thụ hưởng công bằng', '2 nhiệm vụ hội nhập'],
            tag: 'HỘI NHẬP',
            cardId: 'card-13',
            source: 'II.2.c',
          },
          {
            id: 'c14',
            icon: '⭐',
            title: 'Đảng & Hệ thống chính trị',
            keys: ['Đảng lãnh đạo', 'Nhà nước quản lý', 'Nhân dân làm chủ'],
            tag: 'LÃNH ĐẠO',
            cardId: 'card-14',
            source: 'II.2.d',
          },
        ],
      },
    ],
  },
  {
    id: 'iii',
    badge: 'PHẦN III',
    title: 'CÁC QUAN HỆ LỢI ÍCH KINH TẾ Ở VIỆT NAM',
    hook: 'Lợi ích là động lực — Quan hệ vừa thống nhất vừa mâu thuẫn',
    accent: '#38bdf8',
    columns: [
      {
        id: 'iii_1',
        title: '1. Lợi ích kinh tế',
        hook: 'Khái niệm → Bản chất → Biểu hiện → Vai trò',
        leaves: [
          {
            id: 'c15',
            icon: '🎯',
            title: 'Mục tiêu nghiên cứu',
            keys: ['Lý luận quan hệ lợi ích', 'Bảo vệ lợi ích chính đáng'],
            tag: 'MỤC TIÊU',
            cardId: 'card-15',
            source: 'III',
          },
          {
            id: 'c16',
            icon: '🍚',
            title: 'Khái niệm lợi ích kinh tế',
            keys: ['Thỏa mãn nhu cầu', 'Lợi ích vật chất quyết định'],
            tag: 'KHÁI NIỆM',
            cardId: 'card-16',
            source: 'III.1.a.khai-niem-loi-ich-kinh-te',
          },
          {
            id: 'c17',
            icon: '🧭',
            title: 'Bản chất',
            keys: ['Mục đích & động cơ', 'Ăngghen: quan hệ KT biểu hiện qua lợi ích'],
            tag: 'BẢN CHẤT',
            cardId: 'card-17',
            source: 'III.1.a.ban-chat-va-bieu-hien-cua',
          },
          {
            id: 'c18',
            icon: '💰',
            title: 'Biểu hiện',
            keys: ['Chủ DN → lợi nhuận', 'Người LĐ → tiền lương'],
            tag: 'BIỂU HIỆN',
            cardId: 'card-18',
            source: 'III.1.a.ban-chat-va-bieu-hien-cua',
          },
          {
            id: 'c19',
            icon: '⚡',
            title: 'Vai trò 1 — Động lực trực tiếp',
            keys: ['Thu nhập ↑ → thỏa mãn ↑', 'Thôi thúc sáng tạo'],
            tag: 'VAI TRÒ 1',
            cardId: 'card-19',
            source: 'III.1.a.vai-tro-cua-loi-ich-kinh',
          },
          {
            id: 'c20',
            icon: '🌱',
            title: 'Vai trò 2 — Cơ sở lợi ích khác',
            keys: ['Nền cho lợi ích chính trị, văn hóa, xã hội', '"Dân là gốc"'],
            tag: 'VAI TRÒ 2',
            cardId: 'card-20',
            source: 'III.1.a.vai-tro-cua-loi-ich-kinh',
          },
        ],
      },
      {
        id: 'iii_2a',
        title: '2a. Hai mặt & Bốn nhân tố',
        hook: 'Thống nhất ⇄ Mâu thuẫn · LLSX – QHSX – Phân phối – Hội nhập',
        leaves: [
          {
            id: 'c21',
            icon: '🔗',
            title: 'Khái niệm quan hệ lợi ích',
            keys: ['Chiều dọc', 'Chiều ngang', 'Quốc gia ↔ thế giới'],
            tag: 'KHÁI NIỆM',
            cardId: 'card-21',
            source: 'III.1.b.khai-niem-quan-he-loi-ich',
          },
          {
            id: 'c22',
            icon: '🤲',
            title: 'Mặt thống nhất',
            keys: ['Chủ thể là bộ phận của nhau', 'DN hiệu quả → LĐ ổn định'],
            tag: 'THỐNG NHẤT',
            cardId: 'card-22',
            source: 'III.1.b.su-thong-nhat-va-mau-thuan',
          },
          {
            id: 'c23',
            icon: '⚔️',
            title: 'Mặt mâu thuẫn',
            keys: ['Phương thức đối lập', 'Hàng giả, trốn thuế', 'Chia kết quả'],
            tag: 'MÂU THUẪN',
            cardId: 'card-23',
            source: 'III.1.b.su-thong-nhat-va-mau-thuan',
          },
          {
            id: 'c24',
            icon: '🕊️',
            title: 'Điều hòa & Nền tảng',
            keys: ['Nhà nước điều hòa', 'Lợi ích cá nhân là cơ sở'],
            tag: 'ĐIỀU HÒA',
            cardId: 'card-24',
            source: 'III.1.b.su-thong-nhat-va-mau-thuan',
          },
          {
            id: 'c25',
            icon: '🏭',
            title: 'Nhân tố 1 & 2',
            keys: ['Trình độ lực lượng sản xuất', 'Địa vị trong quan hệ sản xuất'],
            tag: 'NHÂN TỐ 1–2',
            cardId: 'card-25',
            source: 'III.1.b.cac-nhan-to-anh-huong-den',
          },
          {
            id: 'c26',
            icon: '🌐',
            title: 'Nhân tố 3 & 4',
            keys: ['Chính sách phân phối', 'Hội nhập kinh tế quốc tế'],
            tag: 'NHÂN TỐ 3–4',
            cardId: 'card-26',
            source: 'III.1.b.cac-nhan-to-anh-huong-den',
          },
        ],
      },
      {
        id: 'iii_2b',
        title: '2b. Các quan hệ & Phương thức',
        hook: 'LĐ ↔ chủ · chủ ↔ chủ · LĐ ↔ LĐ · cá nhân ↔ xã hội · nhóm',
        leaves: [
          {
            id: 'c27',
            icon: '👷',
            title: 'Người LĐ ↔ Người sử dụng LĐ',
            keys: ['Tiền lương = giá cả sức lao động', 'Thống nhất khi DN thuận lợi'],
            tag: 'QUAN HỆ 1',
            cardId: 'card-27',
            source: 'III.1.b.mot-so-quan-he-loi-ich',
          },
          {
            id: 'c28',
            icon: '📢',
            title: 'Mâu thuẫn & Tổ chức đại diện',
            keys: ['Lương ↑ ⇄ Lợi nhuận ↓', 'Công đoàn', 'Nghiệp đoàn giới chủ'],
            tag: 'QUAN HỆ 1',
            cardId: 'card-28',
            source: 'III.1.b.mot-so-quan-he-loi-ich',
          },
          {
            id: 'c29',
            icon: '🏦',
            title: 'Giữa những người sử dụng LĐ',
            keys: ['Vừa đối tác vừa đối thủ', 'Tỷ suất lợi nhuận bình quân', 'Doanh nhân'],
            tag: 'QUAN HỆ 2',
            cardId: 'card-29',
            source: 'III.1.b.mot-so-quan-he-loi-ich',
          },
          {
            id: 'c30',
            icon: '✊',
            title: 'Giữa những người lao động',
            keys: ['Cạnh tranh → ép lương', 'Đoàn kết → yêu sách chính đáng'],
            tag: 'QUAN HỆ 3',
            cardId: 'card-30',
            source: 'III.1.b.mot-so-quan-he-loi-ich',
          },
          {
            id: 'c31',
            icon: '🏘️',
            title: 'Cá nhân ↔ Xã hội',
            keys: ['Làm đúng luật = đóng góp', 'Xã hội định hướng cá nhân'],
            tag: 'QUAN HỆ 4',
            cardId: 'card-31',
            source: 'III.1.b.mot-so-quan-he-loi-ich',
          },
          {
            id: 'c32',
            icon: '🕸️',
            title: 'Lợi ích nhóm & Nhóm lợi ích',
            keys: ['Cùng ngành = lợi ích nhóm', 'Khác ngành = nhóm lợi ích', 'Chống tiêu cực'],
            tag: 'QUAN HỆ 5',
            cardId: 'card-32',
            source: 'III.1.b.mot-so-quan-he-loi-ich',
          },
          {
            id: 'c33',
            icon: '🔀',
            title: '2 phương thức thực hiện',
            keys: ['Nguyên tắc thị trường', 'Chính sách nhà nước & tổ chức xã hội'],
            tag: 'PHƯƠNG THỨC',
            cardId: 'card-33',
            source: 'III.1.b.phuong-thuc-thuc-hien-loi-ich',
          },
        ],
      },
    ],
  },
];

const ALL_LEAVES = BRANCHES.flatMap((b) => b.columns.flatMap((c) => c.leaves));

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

interface Props {
  onSelectCard: (cardId: string) => void;
}

export const MindMapView: React.FC<Props> = ({ onSelectCard }) => {
  const [progress] = useProgress();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState('');

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Đo kích thước thật của cây để khung cuộn bám đúng khi phóng/thu
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      setContentWidth(el.offsetWidth);
      setContentHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitToScreen = () => {
    const vp = viewportRef.current;
    const el = contentRef.current;
    if (!vp || !el) return;
    const usable = vp.clientWidth - 48;
    setZoom(Math.max(0.4, Math.min(1, usable / el.offsetWidth)));
  };

  const q = normalize(query.trim());
  const matches = useMemo(() => {
    if (!q) return null;
    return new Set(
      ALL_LEAVES.filter((l) => normalize(`${l.title} ${l.keys.join(' ')} ${l.tag} ${l.source}`).includes(q)).map(
        (l) => l.id
      )
    );
  }, [q]);

  const learnedCount = ALL_LEAVES.filter((l) => progress.learnedCards.includes(l.cardId)).length;
  const toggle = (id: string) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));

  const renderLeaf = (leaf: Leaf, accent: string) => {
    const learned = progress.learnedCards.includes(leaf.cardId);
    const dimmed = matches !== null && !matches.has(leaf.id);

    return (
      <button
        key={leaf.id}
        onClick={() => onSelectCard(leaf.cardId)}
        title={leaf.keys.join(' • ')}
        className={`group relative w-full overflow-hidden rounded-xl border bg-slate-900/80 p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800/80 cursor-pointer ${
          learned ? 'border-emerald-500/70' : 'border-slate-700/80 hover:border-slate-500'
        } ${dimmed ? 'opacity-25' : 'opacity-100'}`}
      >
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: accent }} />

        <span className="flex items-start gap-2 pl-1.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: `${accent}1f`, border: `1px solid ${accent}66` }}
          >
            {leaf.icon}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-start gap-1.5">
              {learned && <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />}
              <span className="text-[11.5px] font-black leading-snug text-slate-100">{leaf.title}</span>
            </span>
            <span className="mt-0.5 line-clamp-2 block text-[10px] font-semibold leading-snug text-slate-400">
              {leaf.keys.join(' · ')}
            </span>
          </span>

          <span
            className="shrink-0 self-center rounded-md px-1.5 py-0.5 text-[8.5px] font-black tracking-wider"
            style={{ backgroundColor: `${accent}1f`, color: accent, border: `1px solid ${accent}55` }}
          >
            {leaf.tag}
          </span>
        </span>
      </button>
    );
  };

  const renderColumn = (col: Column, accent: string) => {
    const open = !collapsed[col.id];
    const done = col.leaves.filter((l) => progress.learnedCards.includes(l.cardId)).length;

    return (
      // Nhánh con: cuống dọc lên trên + thanh ngang nối các cột cùng cấp
      <div
        key={col.id}
        className="relative flex w-[282px] shrink-0 flex-col pt-7
                   before:absolute before:left-1/2 before:top-0 before:h-7 before:w-px before:bg-slate-600
                   after:absolute after:left-0 after:right-0 after:top-0 after:h-px after:bg-slate-600
                   first:after:left-1/2 last:after:right-1/2 only:after:hidden"
      >
        <div
          className="rounded-xl border bg-slate-900 px-3 py-2 shadow-lg"
          style={{ borderColor: `${accent}80` }}
        >
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-[11.5px] font-black text-slate-100">
              {col.title}
            </span>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black tabular-nums"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              {done}/{col.leaves.length}
            </span>
            <button
              onClick={() => toggle(col.id)}
              aria-label={open ? 'Thu gọn cột' : 'Mở cột'}
              className="shrink-0 rounded-md border border-slate-700 p-0.5 text-slate-300 transition-colors hover:text-white cursor-pointer"
            >
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
          <p className="mt-1 text-[9.5px] font-semibold italic leading-snug text-slate-400">
            💡 {col.hook}
          </p>
        </div>

        {open && (
          <div
            className="mt-3 flex flex-col gap-2 border-l pl-3"
            style={{ borderColor: `${accent}40` }}
          >
            {col.leaves.map((leaf) => renderLeaf(leaf, accent))}
          </div>
        )}
      </div>
    );
  };

  const renderBranch = (branch: Branch) => {
    const leaves = branch.columns.flatMap((c) => c.leaves);
    const done = leaves.filter((l) => progress.learnedCards.includes(l.cardId)).length;

    return (
      <div
        key={branch.id}
        className="relative flex shrink-0 flex-col items-center pt-8
                   before:absolute before:left-1/2 before:top-0 before:h-8 before:w-px before:bg-slate-600
                   after:absolute after:left-0 after:right-0 after:top-0 after:h-px after:bg-slate-600
                   first:after:left-1/2 last:after:right-1/2 only:after:hidden"
      >
        {/* Thẻ phần lớn */}
        <div
          className="rounded-2xl border-2 bg-slate-900 px-4 py-2.5 shadow-xl"
          style={{ borderColor: branch.accent }}
        >
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-black tracking-widest text-slate-950"
              style={{ backgroundColor: branch.accent }}
            >
              {branch.badge}
            </span>
            <span className="text-[12px] font-black tracking-wide text-slate-100">
              {branch.title}
            </span>
            <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-black tabular-nums text-slate-300">
              {done}/{leaves.length}
            </span>
          </div>
          <p className="mt-1 text-center text-[10px] font-semibold italic text-slate-400">
            💡 {branch.hook}
          </p>
        </div>

        {/* Cuống xuống hàng cột */}
        <div className="h-7 w-px bg-slate-600" />

        <div className="flex items-start gap-5">
          {branch.columns.map((col) => renderColumn(col, branch.accent))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Thanh công cụ */}
      <div className="z-10 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Network className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="truncate text-xs font-bold text-slate-200">
            Sơ đồ tư duy cây phân cấp — Chương 5
          </span>
          <span className="shrink-0 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black text-emerald-300">
            {learnedCount}/{ALL_LEAVES.length} thẻ đã học
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm từ khóa (FDI, Công đoàn, sở hữu…)"
              className="w-[230px] rounded-lg border border-slate-700 bg-slate-950 py-1 pl-7 pr-2 text-[11px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
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
              onClick={fitToScreen}
              className="cursor-pointer rounded-lg bg-slate-900 px-1.5 py-1 text-[9px] font-black text-slate-300 hover:bg-slate-800"
              title="Vừa màn hình"
            >
              VỪA
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setCollapsed({});
                setQuery('');
              }}
              className="cursor-pointer rounded-lg bg-slate-900 p-1 text-slate-400 hover:bg-slate-800"
              title="Đặt lại"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Khung cây top-down */}
      <div ref={viewportRef} className="no-scrollbar flex-1 overflow-auto p-6 sm:p-8">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: contentWidth ? contentWidth * zoom : undefined,
            height: contentHeight ? contentHeight * zoom : undefined,
          }}
          className="transition-transform duration-150"
        >
          <div ref={contentRef} className="inline-flex min-w-max flex-col items-center">
            {/* Gốc cây */}
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500/25 to-amber-400/5 px-6 py-3 text-center shadow-2xl">
              <div className="text-sm font-black tracking-wide text-amber-100">{ROOT_TITLE}</div>
              <div className="mt-1 text-[10.5px] font-bold italic text-amber-300/90">
                💡 {ROOT_HOOK}
              </div>
            </div>

            {/* Cuống gốc */}
            <div className="h-8 w-px bg-slate-600" />

            {/* Hai phần lớn */}
            <div className="flex items-start gap-12">{BRANCHES.map(renderBranch)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
