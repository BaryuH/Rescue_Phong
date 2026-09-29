# Công nghệ

Theo `docs/plan-and-spec.md`, mục "Công nghệ và cấu trúc thư mục".

| Phần | Công cụ |
| --- | --- |
| Nền tảng | Vite + TypeScript |
| Giao diện (quiz, hội thoại, menu, bảng chọn chiêu, kiến thức) | React |
| Game (bản đồ trung tâm, overworld, hiệu ứng trận) | Phaser, theo template `phaserjs/template-react-ts` có sẵn EventBus |
| Map và di chuyển | Tiled, plugin grid-engine |
| Chuyển cảnh | Lớp overlay React phủ trên canvas Phaser, mây chụm lại rồi tản ra (chuyển động mượt) |
| Sơ đồ tư duy | markmap, sau này có thể chuyển React Flow |
| Tìm thuật ngữ | Fuse.js và chuẩn hóa bỏ dấu |
| Lưu tiến độ | localStorage trước, sau này thêm Supabase hoặc Firebase nếu cần tài khoản |
| Asset pixel | Kenney Roguelike Modern City (bản đồ) và RPG Urban Pack (nhân vật), 16×16, CC0 |
| Kiểm tra nội dung | `scripts/check-content.mjs` (Node, không cần thư viện) |

## Nền tảng chạy

- Máy tính: điều khiển bằng WASD.
- Điện thoại: bắt buộc xoay ngang, có D-pad ảo. Khi cầm dọc, game tạm dừng và hiện lớp phủ nhắc xoay.

## Chưa chốt

- Nơi triển khai.
- Trợ lý AI: để sau bản demo, chỉ trả lời dựa trên file kiến thức.
