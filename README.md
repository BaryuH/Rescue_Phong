# 🏝️ Rescue Phong — Web Học Tập & Mô Phỏng Kinh Tế Chính Trị Mác - Lênin (Chương 5)

> **Dự án:** Ứng dụng EdTech Gamification hỗ trợ học tập và ôn thi môn **Kinh tế Chính trị Mác - Lênin**  
> **Chủ đề trung tâm:** **Chương 5: Kinh tế thị trường định hướng xã hội chủ nghĩa và các quan hệ lợi ích kinh tế ở Việt Nam**  
> **Tài liệu học tập nền tảng:** `docs/Phần_kiến_thức_chính.md`

---

## 🌟 Ý Tưởng Đột Phá & Trải Nghiệm Học Tập

Ứng dụng được thiết kế hoàn toàn độc bản, biến giáo trình lý luận chính trị thành một **Hành trình phiêu lưu học tập (Gamified EdTech Adventure)**:

### 1. 🗺️ Bản đồ Đảo Phiêu Lưu (Island World Map Navigation)
- Thay thế hoàn toàn thanh điều hướng sidebar thông thường bằng **Bản đồ hòn đảo 3D/Isometric trực quan sinh động**.
- Người học tương tác trực tiếp với các địa danh / công trình trên đảo để truy cập các phân hệ học tập:
  - 🕹️ **Arcade (Đấu Trường Thể Chế):** Game nhập vai Pixel RPG.
  - 🎯 **Thung Lũng Thử Thách:** Chuỗi ải trắc nghiệm phong cách Angry Birds.
  - 📖 **Thư Viện Tri Thức (Achievements/Book):** Kho tài liệu lý luận Chương 5 chuẩn hóa.
  - 🗺️ **Đài Thiên Văn Sơ Đồ:** Sơ đồ tư duy mở rộng tương tác toàn cảnh.
  - 🏪 **Chợ Thuật Ngữ (Market):** Tra cứu từ khóa và lật thẻ Flashcard.
  - 🤖 **Hải Đăng Trí Tuệ (Beacon):** Trợ lý ảo AI đồng hành giải đáp thắc mắc.
  - 🎒 **Tủ Đồ (Locker):** Bảng vàng thành tích, số sao tích lũy và danh hiệu sinh viên.

### 2. 🕹️ Game Mô Phỏng: Pixel RPG "Hành Trình Điều Hòa Thể Chế" (Pokemon Style)
- Đồ họa Pixel 2D Top-down, điều khiển nhân vật di chuyển bằng **WASD / Phím Mũi Tên** (hoặc D-Pad ảo trên điện thoại).
- Khám phá thị trấn, gặp gỡ các NPC đại diện cho các chủ thể kinh tế: *Công nhân, Giám đốc doanh nghiệp, Thanh tra thị trường, Nhóm lợi ích trục lợi, Đại diện FDI*.
- **Màn hình giao đấu theo lượt (Pokemon Battle Screen):**
  - Thanh chỉ số sinh tồn: $HP$ (Tư Bản/Ngân Sách), $Mana$ (Độ Hài Hòa Lợi Ích), $Shield$ (Uy Tín Thể Chế).
  - Chọn các quyết sách kinh tế chính trị làm chiêu thức xử lý tình huống và khắc chế khủng hoảng.
  - Phân tích và đúc rút bài học kinh tế chính trị sau mỗi trận đấu.

### 3. 🎯 Trắc Nghiệm Vượt Ải (Angry Birds Level Style)
- Bản đồ vượt ải qua từng hòn đảo: Màn 1 $\rightarrow$ Màn 2 $\rightarrow$ Màn 3 $\rightarrow$ Màn 4 $\rightarrow$ Màn 5 $\rightarrow$ Màn Đại Thử Thách.
- Mỗi màn gồm đúng **5 câu hỏi trắc nghiệm** cốt lõi được tuyển chọn kỹ lưỡng.
- **Hệ thống đánh giá 1 - 3 Sao:**
  - ⭐⭐⭐ **3 Sao:** Đúng 5/5 câu (Xuất sắc).
  - ⭐⭐ **2 Sao:** Đúng 4/5 câu (Rất tốt).
  - ⭐ **1 Sao:** Đúng 3/5 câu (Đạt chuẩn qua màn).
  - ❌ **0 Sao:** Thử lại (Replay) để ôn luyện lại kiến thức.

---

## 📂 Cấu Trúc Thư Mục Dự Án (Directory Structure)

```
Rescue_Phong/
├── assets/
│   └── packs/                       # Các gói tài nguyên đồ họa RPG, Pixel sprites
│       ├── kenney_RPGurbanPack.zip
│       └── Roguelike Modern City pack.zip
├── docs/
│   ├── ideas.md                     # Bản đặc tả ý tưởng, cơ chế game và lộ trình
│   ├── tech_stack.md                # Tài liệu công nghệ cốt lõi và kiến trúc
│   └── Phần_kiến_thức_chính.md      # Nội dung bài giảng Chương 5 gốc
├── .gitignore                       # Quy tắc bỏ qua file tạm cho Node/Vite
├── LICENSE                          # Giấy phép mã nguồn mở
└── README.md                        # Giới thiệu tổng quan dự án
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** React + Vite + TypeScript (Single Page Application, siêu nhẹ, tải tức thì).
- **Styling & Theme:** Tailwind CSS (Giao diện Gamified EdTech responsive trên Mobile & Desktop).
- **Game Engine & Rendering:** HTML5 Canvas 2D + SVG Interactive Canvas.
- **Motion & Icons:** Framer Motion + Lucide React.
- **Data Persistence:** LocalStorage (Lưu tiến độ game, sao trắc nghiệm offline).
- **Deploy:** Vercel.
