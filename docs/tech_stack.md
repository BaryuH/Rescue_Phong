# TECH STACK DỰ ÁN

## 1. Công nghệ Cốt lõi (Core Stack)
- **Frontend Framework:** React + Vite + TypeScript
  - Chuẩn Single Page Application (SPA) siêu nhẹ, tải tức thì (<1s).
  - TypeScript đảm bảo kiểm soát chặt chẽ kiểu dữ liệu bài giảng, câu hỏi trắc nghiệm, trạng thái bản đồ thế giới và logic game RPG battle.
- **Styling & Design System:** Tailwind CSS
  - Giao diện giáo dục hiện đại kết hợp Gamification (Playful World Map & Retro Pixel Game UI).
  - Tối ưu hiển thị responsive trên cả điện thoại (Mobile với D-Pad ảo) lẫn máy tính (Desktop/Laptop với phím WASD).
  - Phong cách độc bản, sáng tạo, lấy cảm hứng từ Đảo phiêu lưu học tập (World Map Navigation).
- **Game Engine & Rendering:**
  - **Bản đồ Thế giới (World Map):** SVG Canvas tương tác + CSS/Framer Motion animations (hiệu ứng mây bay, sóng nước, đảo nhấp nhô, icon các địa điểm phóng to khi hover/chạm).
  - **Simulation RPG (Pokemon-style Pixel Game):** HTML5 Canvas 2D / Grid-based engine nhẹ tích hợp trong React (chuyển động nhân vật 4 hướng WASD, collision detection, NPC triggers, màn hình đối thoại và đấu trường Battle Screen turn-based).
- **UI Icons & Chuyển động (Motion):** Lucide React + Framer Motion
  - Bộ biểu tượng hiện đại, đồng bộ.
  - Hiệu ứng chuyển động mượt mà khi mở modal tòa nhà, hiệu ứng tung chiêu trong trận đấu, sao bay kết quả Angry Birds quiz.
- **Lưu trữ dữ liệu (Data Persistence):** LocalStorage
  - Lưu tiến độ mở khóa các đảo/màn chơi, số sao tích lũy từng màn Angry Birds (1-3 sao), chỉ số và trang bị nhân vật trong RPG, lịch sử ôn tập.
  - Hoạt động offline 100%, không cần setup backend database.
- **Triển khai (Deployment):** Vercel
  - Tự động hóa CI/CD, tốc độ tải trang tức thì qua CDN.
