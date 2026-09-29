# Dữ liệu nội dung

Mọi nội dung ở đây phải bám sát `docs/Phần_kiến_thức_chính.md`. Mỗi câu hỏi, tình huống,
thuật ngữ và NPC có trường `source` là một id (hoặc danh sách id) trong `docs/knowledge-ids.md`.

| Đường dẫn | Nội dung |
| --- | --- |
| `quiz/*.json` | Mỗi file một chương: `{ "levels": [ { "questions": [ { ..., "source": "II.1.a" } ] } ] }` |
| `scenarios/*.json` | Tình huống mô phỏng, mỗi phần tử có `source` |
| `knowledge/` | Thẻ kiến thức tách từ file kiến thức (sinh bằng script) |
| `terms.json` | Thuật ngữ: `{ "term", "definition", "source" }` |
| `npcs.json` | NPC: `{ "name", "role", "source" }` |
| `difficulty.json` | Ba mức độ khó của mô phỏng |

Kiểm tra trước khi commit:

    node scripts/check-content.mjs
