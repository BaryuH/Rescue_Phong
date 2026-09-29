# Bảng id các mục trong file kiến thức

Mỗi câu hỏi, tình huống, thuật ngữ và NPC phải có trường `source` trỏ tới một hoặc nhiều id dưới đây.
Bảng này sinh tự động từ `docs/Phần_kiến_thức_chính.md`. Khi file thay đổi, chạy lại:

    node scripts/check-content.mjs --list > docs/knowledge-ids.md

Id của mục cha bao trùm các mục con, ví dụ `II.2.a` gồm cả `II.2.a.hoan-thien-the-che-ve-so`.
Nên trỏ tới mục nhỏ nhất chứa nội dung.

| id | Dòng | Tiêu đề |
| --- | --- | --- |
| `C5` | 3 | CHƯƠNG 5: KINH TẾ THỊ TRƯỜNG ĐỊNH HƯỚNG XÃ HỘI CHỦ NGHĨA VÀ CÁC QUAN HỆ LỢI ÍCH KINH TẾ Ở VIỆT NAM (Trang 187 - 214) |
| `II` | 5 | II- HOÀN THIỆN THỂ CHẾ KINH TẾ THỊ TRƯỜNG ĐỊNH HƯỚNG XÃ HỘI CHỦ NGHĨA Ở VIỆT NAM |
| `II.1` | 7 | 1. Sự cần thiết phải hoàn thiện thể chế kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam |
| `II.1.a` | 9 | a) Thể chế và thể chế kinh tế |
| `II.1.a.the-che` | 11 | * Thể chế |
| `II.1.a.the-che-kinh-te` | 15 | * Thể chế kinh tế |
| `II.1.b` | 21 | b) Thể chế kinh tế thị trường định hướng xã hội chủ nghĩa |
| `II.2` | 52 | 2. Nội dung hoàn thiện thể chế kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam |
| `II.2.a` | 54 | a) Hoàn thiện thể chế về sở hữu, phát triển các thành phần kinh tế, các loại hình doanh nghiệp |
| `II.2.a.hoan-thien-the-che-ve-so` | 56 | - Hoàn thiện thể chế về sở hữu trong nền kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam cần thực hiện các nội dung sau: |
| `II.2.a.hoan-thien-the-che-phat-trien` | 68 | - Hoàn thiện thể chế phát triển các thành phần kinh tế, các loại hình doanh nghiệp cần thực hiện các nội dung sau: |
| `II.2.b` | 81 | b) Hoàn thiện thể chế phát triển đồng bộ các yếu tố thị trường và các loại thị trường |
| `II.2.c` | 89 | c) Hoàn thiện thể chế gắn kết tăng trưởng kinh tế với bảo đảm phát triển bền vững, tiến bộ và công bằng xã hội và thúc đẩy hội nhập quốc tế |
| `II.2.d` | 98 | d) Hoàn thiện thể chế, đẩy mạnh, nâng cao năng lực lãnh đạo của Đảng và hệ thống chính trị |
| `III` | 106 | III- CÁC QUAN HỆ LỢI ÍCH KINH TẾ Ở VIỆT NAM |
| `III.1` | 110 | 1. Lợi ích kinh tế và quan hệ lợi ích kinh tế |
| `III.1.a` | 112 | a) Lợi ích kinh tế |
| `III.1.a.khai-niem-loi-ich-kinh-te` | 114 | * Khái niệm lợi ích kinh tế |
| `III.1.a.ban-chat-va-bieu-hien-cua` | 124 | * Bản chất và biểu hiện của lợi ích kinh tế |
| `III.1.a.vai-tro-cua-loi-ich-kinh` | 136 | * Vai trò của lợi ích kinh tế đối với các chủ thể kinh tế - xã hội |
| `III.1.b` | 168 | b) Quan hệ lợi ích kinh tế |
| `III.1.b.khai-niem-quan-he-loi-ich` | 170 | * Khái niệm quan hệ lợi ích kinh tế |
| `III.1.b.su-thong-nhat-va-mau-thuan` | 176 | * Sự thống nhất và mâu thuẫn trong các quan hệ lợi ích kinh tế |
| `III.1.b.cac-nhan-to-anh-huong-den` | 194 | * Các nhân tố ảnh hưởng đến quan hệ lợi ích kinh tế |
| `III.1.b.mot-so-quan-he-loi-ich` | 210 | * Một số quan hệ lợi ích kinh tế cơ bản trong nền kinh tế thị trường |
| `III.1.b.phuong-thuc-thuc-hien-loi-ich` | 248 | * Phương thức thực hiện lợi ích kinh tế trong các quan hệ lợi ích chủ yếu |
