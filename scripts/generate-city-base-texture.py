#!/usr/bin/env python3
import os
from PIL import Image

sheet_path = 'public/assets/kenney/modern-city/Spritesheet/roguelikeCity_magenta.png'
sheet = Image.open(sheet_path).convert('RGBA')

TILE_SIZE = 16
SPACING = 1
MAP_W = 48
MAP_H = 34

def get_tile(col, row):
    col = max(0, min(36, col))
    row = max(0, min(27, row))
    x0 = col * (TILE_SIZE + SPACING)
    y0 = row * (TILE_SIZE + SPACING)
    return sheet.crop((x0, y0, x0 + TILE_SIZE, y0 + TILE_SIZE))

canvas = Image.new('RGBA', (MAP_W * TILE_SIZE, MAP_H * TILE_SIZE), (45, 145, 55, 255))

# Core Tile Indices
T_GRASS = (0, 24)
T_GRASS_FLOWER = (1, 24)
T_GRASS_TUFT = (2, 24)
T_ROAD_ASPHALT = (10, 20)
T_ROAD_V_DASH = (9, 20)
T_ROAD_H_DASH = (10, 19)
T_CROSSWALK_H = (11, 21)
T_CROSSWALK_V = (12, 21)
T_SIDEWALK = (1, 19)
T_PLAZA_PAVING = (5, 19)

# Iron Fence tiles (Kenney Modern City)
FENCE_H = (6, 16)       # Thanh rào sắt ngang
FENCE_V = (5, 17)       # Thanh rào sắt dọc
FENCE_TL = (4, 15)      # Góc rào trên-trái ┌
FENCE_TR = (7, 15)      # Góc rào trên-phải ┐
FENCE_BL = (4, 16)      # Góc rào dưới-trái └
FENCE_BR = (7, 16)      # Góc rào dưới-phải ┘
FENCE_GATE = (5, 16)    # Cổng rào sắt mở
FENCE_POST = (4, 17)    # Trụ sắt / Bollard

# Props
T_TREE_TOP = (22, 5)
T_TREE_BOTTOM = (22, 6)
T_TREE_PINE_TOP = (23, 5)
T_TREE_PINE_BOT = (23, 6)
T_LAMP = (1, 14)
T_BENCH = (2, 14)
T_FOUNTAIN = (11, 14)
T_CAR_RED = (34, 15)
T_CAR_BLUE = (35, 15)
T_CAR_YELLOW = (36, 15)

# Layer 0: Lush Grass everywhere
for y in range(MAP_H):
    for x in range(MAP_W):
        r = (x * 11 + y * 17) % 31
        t = T_GRASS_FLOWER if r == 0 else (T_GRASS_TUFT if r == 5 else T_GRASS)
        canvas.paste(get_tile(*t), (x * TILE_SIZE, y * TILE_SIZE))

def paste_tile(tile_coords, x, y):
    if 0 <= x < MAP_W and 0 <= y < MAP_H:
        t = get_tile(*tile_coords)
        canvas.paste(t, (x * TILE_SIZE, y * TILE_SIZE), t)

def fill_rect(tile_coords, x1, y1, x2, y2):
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            paste_tile(tile_coords, x, y)

def draw_fenced_perimeter(x1, y1, x2, y2, gate_x1=None, gate_x2=None, gate_side='bottom'):
    """Vẽ hàng rào sắt bao quanh một mảnh đất có cổng ra vào"""
    for x in range(x1 + 1, x2):
        paste_tile(FENCE_H, x, y1)
    for x in range(x1 + 1, x2):
        if gate_side == 'bottom' and gate_x1 is not None and gate_x1 <= x <= gate_x2:
            paste_tile(FENCE_GATE, x, y2)
        else:
            paste_tile(FENCE_H, x, y2)
    for y in range(y1 + 1, y2):
        paste_tile(FENCE_V, x1, y)
    for y in range(y1 + 1, y2):
        paste_tile(FENCE_V, x2, y)
    paste_tile(FENCE_TL, x1, y1)
    paste_tile(FENCE_TR, x2, y1)
    paste_tile(FENCE_BL, x1, y2)
    paste_tile(FENCE_BR, x2, y2)

def draw_building(x, y, w, h, roof_type='brown', wall_type='red', has_door=True):
    r_cols = {'brown': 0, 'gray': 4, 'blue': 12, 'orange': 8, 'red': 0}.get(roof_type, 0)
    w_cols = {'red': 0, 'beige': 4, 'glass': 9, 'stone': 1}.get(wall_type, 0)
    
    # Roof rows
    for ry in range(2):
        for rx in range(w):
            col_offset = 0 if rx == 0 else (2 if rx == w - 1 else 1)
            paste_tile((r_cols + col_offset, ry), x + rx, y + ry)
    # Wall rows
    for wy in range(2, h):
        for wx in range(w):
            col_offset = 0 if wx == 0 else (2 if wx == w - 1 else 1)
            paste_tile((w_cols + col_offset, 5), x + wx, y + wy)
            if wy == 2 and 0 < wx < w - 1 and (wx % 2 == 1 or w <= 4):
                paste_tile((0, 16), x + wx, y + wy)
    if has_door:
        door_x = x + w // 2
        paste_tile((2, 17), door_x, y + h - 1)

# ==========================================
# 1. HỆ THỐNG GIAO THÔNG (ROADS & SIDEWALKS)
# ==========================================
# Đại lộ Bắc - Nam (Cols 17-19)
fill_rect(T_SIDEWALK, 16, 0, 16, MAP_H - 1)
fill_rect(T_ROAD_ASPHALT, 17, 0, 19, MAP_H - 1)
for y in range(0, MAP_H):
    paste_tile(T_ROAD_V_DASH, 18, y)
fill_rect(T_SIDEWALK, 20, 0, 20, MAP_H - 1)

# Đại lộ Đông - Tây 1 (Rows 14-16)
fill_rect(T_SIDEWALK, 0, 13, MAP_W - 1, 13)
fill_rect(T_ROAD_ASPHALT, 0, 14, MAP_W - 1, 16)
for x in range(0, MAP_W):
    paste_tile(T_ROAD_H_DASH, x, 15)
fill_rect(T_SIDEWALK, 0, 17, MAP_W - 1, 17)

# Đại lộ Phố Thể Chế Phía Nam (Rows 27-29)
fill_rect(T_SIDEWALK, 0, 26, 30, 26)
fill_rect(T_ROAD_ASPHALT, 0, 27, 30, 29)
for x in range(0, 31):
    paste_tile(T_ROAD_H_DASH, x, 28)
fill_rect(T_SIDEWALK, 0, 30, 30, 30)

# Vạch sang đường (Crosswalks)
for y in range(14, 17):
    paste_tile(T_CROSSWALK_H, 15, y)
    paste_tile(T_CROSSWALK_H, 21, y)
for x in range(17, 20):
    paste_tile(T_CROSSWALK_V, x, 12)
    paste_tile(T_CROSSWALK_V, x, 18)
    paste_tile(T_CROSSWALK_V, x, 25)

# ==========================================
# 2. MẢNH ĐẤT 1: KHUÔN VIÊN TRI THỨC (North-West)
# Rào sắt bao quanh 4 phía, có cổng mở ra vỉa hè
# ==========================================
K1_X1, K1_Y1, K1_X2, K1_Y2 = 1, 1, 15, 12

# Sân lát đá và lối đi bộ
fill_rect(T_PLAZA_PAVING, 7, 7, 9, 12)
fill_rect(T_PLAZA_PAVING, 4, 7, 12, 7)

# Rào sắt bao quanh khuôn viên, cổng ở hàng 12 (cột 7-9)
draw_fenced_perimeter(K1_X1, K1_Y1, K1_X2, K1_Y2, gate_x1=7, gate_x2=9, gate_side='bottom')

# 3 Tòa nhà phân bố khoa học, không dính vào nhau:
draw_building(2, 3, 5, 4, roof_type='blue', wall_type='stone')      # Thư Viện (Tây Bắc)
draw_building(10, 3, 5, 4, roof_type='gray', wall_type='glass')     # Đài Quan Sát (Đông Bắc)
draw_building(5, 8, 6, 4, roof_type='brown', wall_type='beige')     # Nhà Lưu Trữ (Trung tâm)

# Cây xanh, đèn đường và ghế đá trong sân viện
paste_tile(T_TREE_PINE_TOP, 8, 2)
paste_tile(T_TREE_PINE_BOT, 8, 3)
paste_tile(T_TREE_TOP, 2, 8)
paste_tile(T_TREE_BOTTOM, 2, 9)
paste_tile(T_TREE_TOP, 14, 8)
paste_tile(T_TREE_BOTTOM, 14, 9)
paste_tile(T_BENCH, 3, 7)
paste_tile(T_BENCH, 13, 7)
paste_tile(T_LAMP, 6, 12)
paste_tile(T_LAMP, 10, 12)

# ==========================================
# 3. MẢNH ĐẤT 2: TÒA THỬ THÁCH (North-Center)
# ==========================================
T_X1, T_Y1, T_X2, T_Y2 = 21, 1, 30, 12
fill_rect(T_PLAZA_PAVING, 22, 9, 29, 12)

# Rào sắt bao quanh Tòa Thử Thách, cổng tại cột 24-27
draw_fenced_perimeter(T_X1, T_Y1, T_X2, T_Y2, gate_x1=24, gate_x2=27, gate_side='bottom')

# Tòa tháp cao tầng
draw_building(23, 2, 7, 7, roof_type='orange', wall_type='glass')
paste_tile(T_LAMP, 23, 12)
paste_tile(T_LAMP, 28, 12)
paste_tile(T_TREE_TOP, 22, 4)
paste_tile(T_TREE_BOTTOM, 22, 5)
paste_tile(T_TREE_TOP, 29, 4)
paste_tile(T_TREE_BOTTOM, 29, 5)

# ==========================================
# 4. MẢNH ĐẤT 3: QUẢNG TRƯỜNG & TOÀ NHÀ PHỤ (West-Center)
# 4 Tòa nhà nằm ở 4 góc ĐỘC LẬP, giữa có khoảng cách và đài phun nước
# ==========================================
Q_X1, Q_Y1, Q_X2, Q_Y2 = 1, 18, 15, 25
fill_rect(T_PLAZA_PAVING, 2, 19, 14, 24)

# Rào sắt bao quanh quảng trường, cổng ở phía Đông (hàng 21-22) và phía Nam (hàng 25)
draw_fenced_perimeter(Q_X1, Q_Y1, Q_X2, Q_Y2, gate_x1=7, gate_x2=9, gate_side='bottom')

# 4 Tòa nhà phụ tách biệt rõ rệt (hàng 19-21 và hàng 23-25, hàng 22 là lối đi thông thoáng):
draw_building(2, 19, 4, 3, roof_type='brown', wall_type='beige')    # Hồ Sơ (Tây Bắc)
draw_building(11, 19, 4, 3, roof_type='blue', wall_type='stone')    # Huy Hiệu (Đông Bắc)
draw_building(2, 23, 4, 3, roof_type='gray', wall_type='glass')     # Xếp Hạng (Tây Nam)
draw_building(11, 23, 4, 3, roof_type='orange', wall_type='red')    # Cài Đặt (Đông Nam)

# Trung tâm quảng trường (hàng 21-22): Đài phun nước, ghế đá, cột đèn
paste_tile(T_FOUNTAIN, 8, 21)
paste_tile(T_BENCH, 6, 21)
paste_tile(T_BENCH, 10, 21)
paste_tile(T_LAMP, 8, 19)
paste_tile(T_LAMP, 8, 23)

# ==========================================
# 5. MẢNH ĐẤT 4: PHỐ THỂ CHẾ (KHU 1 - South Street)
# Có rào ngăn phía sau và cổng chào
# ==========================================
for x in range(1, 31):
    paste_tile(FENCE_H, x, 30)

draw_building(1, 31, 4, 3, roof_type='red', wall_type='red')
draw_building(6, 31, 4, 3, roof_type='blue', wall_type='glass')
draw_building(11, 31, 4, 3, roof_type='orange', wall_type='beige')
draw_building(16, 31, 4, 3, roof_type='gray', wall_type='stone')
draw_building(21, 31, 4, 3, roof_type='brown', wall_type='red')
draw_building(26, 31, 5, 3, roof_type='blue', wall_type='stone')

paste_tile(T_CAR_RED, 22, 18)
paste_tile(T_CAR_BLUE, 25, 18)
paste_tile(T_CAR_YELLOW, 5, 25)

# ==========================================
# 6. MẢNH ĐẤT 5: KHU 2: PHỐ LỢI ÍCH (Phía Đông)
# Hàng rào chắn kiên cố ngăn cách toàn bộ
# ==========================================
for by in range(0, MAP_H):
    if by in [14, 15, 16]:
        paste_tile(FENCE_GATE, 31, by)
    else:
        paste_tile(FENCE_V, 31, by)

for bx in range(32, 48):
    for by in range(MAP_H):
        if (bx + by) % 3 == 0:
            paste_tile(T_PLAZA_PAVING, bx, by)

draw_building(34, 3, 6, 5, roof_type='gray', wall_type='glass')
draw_building(42, 4, 5, 5, roof_type='blue', wall_type='stone')
draw_building(34, 19, 6, 5, roof_type='brown', wall_type='red')
draw_building(42, 20, 5, 6, roof_type='orange', wall_type='beige')

scaled_img = canvas.resize((canvas.width * 2, canvas.height * 2), Image.NEAREST)

out_dir = 'public/assets/maps'
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, 'city-base.png')
scaled_img.save(out_file)
print(f"Đã xuất texture hoàn thiện có rào sắt và bố cục chuẩn: {out_file} ({scaled_img.width}x{scaled_img.height})")
