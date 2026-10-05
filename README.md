# Nhóm 2 - Game Kinh Tế Chính Trị Mác - Lênin

Game học tập cho sinh viên đang học môn **Kinh tế chính trị Mác - Lênin**, nội dung Chương 5
(mục II: Hoàn thiện thể chế kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam;
mục III: Các quan hệ lợi ích kinh tế ở Việt Nam).

Màn hình chính là bản đồ một thành phố pixel art. Từ đó người chơi vào ba phần chính:
- **Khu Tri thức:** đọc bài, xem sơ đồ tư duy, tra thuật ngữ.
- **Tòa thử thách:** quiz theo màn kiểu Angry Birds, mỗi màn 5 câu, chấm 1–3 sao.
- **Khu kinh doanh:** mô phỏng RPG kiểu Pokémon, đi bằng WASD và "đấu" với NPC bằng cách chọn cách xử lý tình huống.

## Quy tắc nội dung

Mọi kiến thức, câu hỏi, tình huống, thuật ngữ và phần sáng tạo (NPC, tên chiêu, cốt truyện)
phải bám sát `docs/Phần_kiến_thức_chính.md`. Mỗi mục nội dung có trường `source` trỏ tới
một id trong `docs/knowledge-ids.md`. Kiểm tra trước khi commit:

    node scripts/check-content.mjs

## Tài liệu

| File | Nội dung |
| --- | --- |
| `docs/plan-and-spec.md` | Plan và spec, tài liệu chuẩn của dự án |
| `docs/Phần_kiến_thức_chính.md` | Nguồn kiến thức duy nhất |
| `docs/knowledge-ids.md` | Id của 26 mục trong file kiến thức |
| `docs/tech_stack.md` | Công nghệ |
| `docs/tile-catalog.md`, `docs/tiles/` | Bảng tra tile Kenney |

## Cấu trúc thư mục

```
Rescue_Phong/
├── assets/packs/            File zip gốc của hai gói Kenney
├── docs/                    Tài liệu (bảng trên)
├── public/assets/
│   ├── kenney/modern-city/  Tile bản đồ (Roguelike Modern City, CC0)
│   ├── kenney/rpg-urban/    Nhân vật (RPG Urban Pack, CC0)
│   ├── clouds/              Sprite mây (tự vẽ)
│   ├── maps/                Bản đồ Tiled
│   └── audio/
├── scripts/
│   └── check-content.mjs    Kiểm tra quy tắc nội dung
└── src/
    ├── game/scenes/         Cảnh Phaser: bản đồ trung tâm, overworld, trận đấu
    ├── ui/                  Giao diện React: quiz, hộp thoại, chuyển cảnh mây
    ├── ui/knowledge/        Trình đọc bài, sơ đồ tư duy, sổ thuật ngữ
    ├── systems/             Tiến độ, lưu game, engine trận đấu
    └── data/                Nội dung JSON (xem src/data/README.md)
```

## Asset

Đồ họa dùng hai gói CC0 của [Kenney](https://www.kenney.nl): Roguelike Modern City và RPG Urban Pack.
