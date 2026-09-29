# Bảng tra tile Kenney

Cả hai gói đều là tile 16×16, giấy phép CC0. Ảnh đánh số để tra nằm trong `docs/tiles/`:
số trên mỗi ô là chỉ số tile dùng trong Tiled và Phaser.

| Gói | Dùng cho | File ảnh | Lưới | Khoảng cách | Chỉ số |
| --- | --- | --- | --- | --- | --- |
| Roguelike Modern City | Bản đồ: đường, vỉa hè, tòa nhà, xe, đồ vật | `public/assets/kenney/modern-city/Spritesheet/roguelikeCity_magenta.png` | 37 cột × 28 hàng (1.036 tile) | 1px | `hàng × 37 + cột` |
| RPG Urban Pack | Nhân vật (6 người, đi 4 hướng) | `public/assets/kenney/rpg-urban/Tilemap/tilemap_packed.png` | 27 cột × 18 hàng (486 tile) | 0px | `hàng × 27 + cột` |

## Lưu ý

- **Tên file bị ngược:** trong gói City, file `roguelikeCity_magenta.png` mới là bản nền trong suốt; file `roguelikeCity_transparent.png` có nền hồng. Luôn dùng file `_magenta`.
- **Không trộn mặt đường hai gói:** Urban có đường xám tím, tông ấm; City có đường nhựa đen, tông lạnh. Bản đồ chỉ dùng City; Urban chỉ lấy nhân vật.
- **Đã thử ghép:** nhân vật Urban đặt lên đường phố City trông khớp về tỉ lệ và màu (`docs/tiles/style-check-urban-on-city.png`).
- **Thêm NPC:** gói Urban chỉ có 6 nhân vật; NPC khác tạo bằng cách tô lại màu tóc và quần áo.

## Vùng tile (sơ bộ, đối chiếu lại bằng ảnh đánh số)

**Roguelike Modern City**

| Hàng | Nội dung |
| --- | --- |
| 0–3 | Mái nhà nhiều màu (nâu, xám, be, xanh) |
| 4–12 | Mặt tiền: tường gạch đỏ, gạch xám, gạch be, tường kính văn phòng, mái hiên sọc xanh và cam; cột bên phải có biển hiệu, cây |
| 13–18 | Đồ vật đường phố: đèn giao thông, cột đèn, ghế, hàng rào, thùng rác, trụ cứu hỏa; cửa và cửa sổ; xe ở các cột bên phải |
| 19–23 | Vỉa hè (cột 0–8), mặt đường và vạch kẻ, vạch sang đường, bãi đỗ xe (cột 9–19); xe ở các cột bên phải |
| 24–27 | Cỏ và đất (cột 0–19), cửa, xe |

**RPG Urban Pack**

| Vùng | Nội dung |
| --- | --- |
| Cột 23–26, mọi hàng | Nhân vật: 6 người, mỗi người đi 4 hướng |
| Cột 0–7, hàng 0–5 | Cỏ, cát, công viên có viền |
| Cột 8–15, hàng 0–5 | Nền lát, quảng trường |
| Cột 16–22, hàng 0–7 | Mái nhà (đỏ, cam) |
| Cột 16–22, hàng 8–13 | Cây (xanh, cam) |
| Cột 15–22, hàng 14–17 | Xe (taxi, ô tô đỏ, xe tải xanh) |
