// Kiểm tra quy tắc nội dung: mọi câu hỏi, tình huống, thuật ngữ phải trỏ về một mục
// trong docs/Phần_kiến_thức_chính.md qua trường "source".
//   node scripts/check-content.mjs          kiểm tra nội dung trong src/data
//   node scripts/check-content.mjs --list   in bảng id của mọi mục trong file kiến thức
import fs from 'node:fs';
import path from 'node:path';

const KNOW = 'docs/Phần_kiến_thức_chính.md';
const DATA = 'src/data';

const slug = (s, words = 6) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, words).join('-');

// Khóa của một tiêu đề: "II-" -> II, "1." -> 1, "a)" -> a, "CHƯƠNG 5" -> C5, còn lại: 6 chữ đầu.
function key(text) {
  const t = text.replace(/\\\*/g, '').replace(/^[\s*\-]+/, '').replace(/[:\s]+$/, '');
  let m;
  if ((m = t.match(/^CHƯƠNG\s+(\d+)/i))) return `C${m[1]}`;
  if ((m = t.match(/^([IVX]+)\s*[-.]\s/))) return m[1];
  if ((m = t.match(/^(\d+)\.\s/))) return m[1];
  if ((m = t.match(/^([a-z])\)\s/))) return m[1];
  return slug(t);
}

export function sections(md) {
  const out = [];
  const stack = [];
  md.split(/\r?\n/).forEach((line, i) => {
    const m = line.match(/^(#{2,6})\s+(.+?)\s*$/);
    if (!m) return;
    const level = m[1].length;
    const k = key(m[2]);
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    if (k.startsWith('C') && /^C\d+$/.test(k)) { out.push({ id: k, title: m[2], line: i + 1 }); return; }
    stack.push({ level, k });
    out.push({ id: stack.map((s) => s.k).join('.'), title: m[2].replace(/\\\*/g, '*'), line: i + 1 });
  });
  return out;
}

const md = fs.readFileSync(KNOW, 'utf8');
const secs = sections(md);
const ids = new Set(secs.map((s) => s.id));

if (process.argv.includes('--list')) {
  console.log(`# Bảng id các mục trong file kiến thức

Mỗi câu hỏi, tình huống, thuật ngữ và NPC phải có trường \`source\` trỏ tới một hoặc nhiều id dưới đây.
Bảng này sinh tự động từ \`${KNOW}\`. Khi file thay đổi, chạy lại:

    node scripts/check-content.mjs --list > docs/knowledge-ids.md

Id của mục cha bao trùm các mục con, ví dụ \`II.2.a\` gồm cả \`II.2.a.hoan-thien-the-che-ve-so\`.
Nên trỏ tới mục nhỏ nhất chứa nội dung.
`);
  console.log('| id | Dòng | Tiêu đề |\n| --- | --- | --- |');
  for (const s of secs) console.log(`| \`${s.id}\` | ${s.line} | ${s.title.replace(/\|/g, '\\|')} |`);
  process.exit(0);
}

const errors = [];
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const jsonIn = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f)) : []);

function need(item, where) {
  const src = item?.source;
  if (!src || (Array.isArray(src) && !src.length)) return errors.push(`${where}: thiếu "source"`);
  for (const s of [].concat(src)) if (!ids.has(s)) errors.push(`${where}: source "${s}" không có trong ${KNOW}`);
}

for (const f of jsonIn(`${DATA}/quiz`))
  (readJson(f).levels ?? []).forEach((lv, i) => (lv.questions ?? []).forEach((q, j) => need(q, `${f} màn ${i + 1} câu ${j + 1}`)));
for (const f of jsonIn(`${DATA}/scenarios`))
  [].concat(readJson(f)).forEach((s, i) => need(s, `${f} tình huống ${i + 1} (${s.id ?? '?'})`));
for (const f of [`${DATA}/terms.json`, `${DATA}/npcs.json`].filter(fs.existsSync))
  readJson(f).forEach((t, i) => need(t, `${f} mục ${i + 1} (${t.term ?? t.name ?? '?'})`));

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} lỗi. Mọi nội dung phải lấy từ ${KNOW}.`);
  process.exit(1);
}
console.log(`OK: toàn bộ nội dung trỏ về ${ids.size} mục trong ${KNOW}.`);
