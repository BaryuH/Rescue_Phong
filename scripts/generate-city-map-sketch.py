#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont

# Load spritesheet
sheet_path = 'public/assets/kenney/modern-city/Spritesheet/roguelikeCity_magenta.png'
if not os.path.exists(sheet_path):
    print(f"Error: {sheet_path} not found")
    exit(1)

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

# Create base canvas
canvas = Image.new('RGBA', (MAP_W * TILE_SIZE, MAP_H * TILE_SIZE), (40, 140, 50, 255))

# Common tile shortcuts
T_GRASS = (0, 24)
T_GRASS_FLOWER = (1, 24)
T_DIRT = (4, 24)
T_ROAD_ASPHALT = (10, 20)
T_ROAD_V_DASH = (9, 20)
T_ROAD_H_DASH = (10, 19)
T_CROSSWALK_H = (11, 21)
T_CROSSWALK_V = (12, 21)
T_SIDEWALK = (1, 19)
T_PLAZA_PAVING = (5, 19)
T_TREE_TOP = (22, 5)
T_TREE_BOTTOM = (22, 6)
T_LAMP = (1, 14)
T_BENCH = (2, 14)
T_FOUNTAIN = (3, 14)
T_CAR_RED = (34, 15)
T_CAR_BLUE = (35, 15)
T_CAR_YELLOW = (36, 15)

# Layer 1: Ground (Fill all with grass)
for y in range(MAP_H):
    for x in range(MAP_W):
        # Vary grass texture slightly
        t = T_GRASS_FLOWER if (x * 7 + y * 13) % 19 == 0 else T_GRASS
        canvas.paste(get_tile(*t), (x * TILE_SIZE, y * TILE_SIZE))

def paste_tile(tile_coords, x, y):
    if 0 <= x < MAP_W and 0 <= y < MAP_H:
        t = get_tile(*tile_coords)
        canvas.paste(t, (x * TILE_SIZE, y * TILE_SIZE), t)

def fill_rect(tile_coords, x1, y1, x2, y2):
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            paste_tile(tile_coords, x, y)

# 1. Main Roads System
# Horizontal Boulevard 1 (Row 15-17): Đại lộ nối Tây sang Đông
fill_rect(T_SIDEWALK, 0, 14, MAP_W - 1, 14)
fill_rect(T_ROAD_ASPHALT, 0, 15, MAP_W - 1, 17)
for x in range(0, MAP_W):
    paste_tile(T_ROAD_H_DASH, x, 16)
fill_rect(T_SIDEWALK, 0, 18, MAP_W - 1, 18)

# Horizontal Boulevard 2 (Row 28-30): Phố Thể Chế phía Nam
fill_rect(T_SIDEWALK, 0, 27, 30, 27)
fill_rect(T_ROAD_ASPHALT, 0, 28, 30, 30)
for x in range(0, 31):
    paste_tile(T_ROAD_H_DASH, x, 29)
fill_rect(T_SIDEWALK, 0, 31, 30, 31)

# Vertical Avenue (Cols 17-19): Đại lộ Bắc - Nam nối Quảng trường & Tòa Thử Thách
fill_rect(T_SIDEWALK, 16, 0, 16, MAP_H - 1)
fill_rect(T_ROAD_ASPHALT, 17, 0, 19, MAP_H - 1)
for y in range(0, MAP_H):
    paste_tile(T_ROAD_V_DASH, 18, y)
fill_rect(T_SIDEWALK, 20, 0, 20, MAP_H - 1)

# Crosswalks
for y in range(15, 18):
    paste_tile(T_CROSSWALK_H, 15, y)
    paste_tile(T_CROSSWALK_H, 21, y)
for x in range(17, 20):
    paste_tile(T_CROSSWALK_V, x, 13)
    paste_tile(T_CROSSWALK_V, x, 19)

# 2. Helper to draw buildings
def draw_building(x, y, w, h, roof_type='brown', wall_type='red', has_door=True):
    # Roofs
    r_cols = {'brown': 0, 'gray': 4, 'blue': 12, 'orange': 8}.get(roof_type, 0)
    w_cols = {'red': 0, 'beige': 4, 'glass': 9, 'stone': 1}.get(wall_type, 0)
    
    # Roof rows (2 rows high)
    for ry in range(2):
        for rx in range(w):
            col_offset = 0 if rx == 0 else (2 if rx == w - 1 else 1)
            paste_tile((r_cols + col_offset, ry), x + rx, y + ry)
    # Walls (h - 2 rows high)
    for wy in range(2, h):
        for wx in range(w):
            col_offset = 0 if wx == 0 else (2 if wx == w - 1 else 1)
            # Wall tile
            paste_tile((w_cols + col_offset, 5), x + wx, y + wy)
            # Windows
            if wy == 2 and 0 < wx < w - 1 and wx % 2 == 1:
                paste_tile((0, 16), x + wx, y + wy)
    # Door in center
    if has_door:
        door_x = x + w // 2
        paste_tile((2, 17), door_x, y + h - 1)

# --- ZONE 1: KHU TRI THỨC (Cols 2-15, Rows 2-13) ---
# Paved courtyard
fill_rect(T_PLAZA_PAVING, 2, 2, 15, 13)
# 3 Buildings in Knowledge Zone
draw_building(3, 3, 5, 4, roof_type='blue', wall_type='stone')     # Thư Viện (Library)
draw_building(10, 3, 4, 4, roof_type='gray', wall_type='glass')    # Đài Quan Sát (Observatory)
draw_building(4, 9, 6, 4, roof_type='brown', wall_type='beige')    # Nhà Lưu Trữ (Archive)

# Trees & benches in courtyard
paste_tile(T_TREE_TOP, 12, 9)
paste_tile(T_TREE_BOTTOM, 12, 10)
paste_tile(T_TREE_TOP, 14, 9)
paste_tile(T_TREE_BOTTOM, 14, 10)
paste_tile(T_BENCH, 11, 10)
paste_tile(T_LAMP, 2, 13)
paste_tile(T_LAMP, 15, 13)

# --- ZONE 2: TÒA THỬ THÁCH (Cols 22-29, Rows 3-12) ---
# Plaza surrounding challenge tower
fill_rect(T_PLAZA_PAVING, 21, 2, 30, 13)
draw_building(22, 4, 8, 8, roof_type='orange', wall_type='glass')  # Big Challenge Tower
paste_tile(T_LAMP, 21, 12)
paste_tile(T_LAMP, 30, 12)
paste_tile(T_BENCH, 21, 8)
paste_tile(T_BENCH, 30, 8)
paste_tile(T_TREE_TOP, 21, 4)
paste_tile(T_TREE_BOTTOM, 21, 5)
paste_tile(T_TREE_TOP, 30, 4)
paste_tile(T_TREE_BOTTOM, 30, 5)

# --- ZONE 3: QUẢNG TRƯỜNG & TOÀ NHÀ PHỤ (Cols 2-15, Rows 19-26) ---
fill_rect(T_PLAZA_PAVING, 2, 19, 15, 26)
draw_building(3, 20, 3, 3, roof_type='brown', wall_type='beige')   # Hồ sơ
draw_building(7, 20, 3, 3, roof_type='blue', wall_type='stone')     # Huy hiệu
draw_building(11, 20, 3, 3, roof_type='gray', wall_type='glass')   # Xếp hạng
draw_building(3, 24, 4, 3, roof_type='orange', wall_type='red')     # Cài đặt

# Spawn Point marker at plaza center (x=10, y=24)
paste_tile((11, 14), 10, 24) # fountain/monument
paste_tile(T_BENCH, 8, 24)
paste_tile(T_BENCH, 12, 24)

# --- ZONE 4: KHU KINH DOANH 1 - PHỐ THỂ CHẾ (Cols 2-29, Rows 27-33) ---
# South street businesses
draw_building(2, 31, 4, 3, roof_type='red', wall_type='red')       # DN Nam Long
draw_building(7, 31, 4, 3, roof_type='blue', wall_type='glass')     # Startup Trí Việt
draw_building(12, 31, 4, 3, roof_type='orange', wall_type='beige') # HTX Bác Ba
draw_building(17, 31, 4, 3, roof_type='gray', wall_type='stone')   # FDI GlobalTech
draw_building(22, 31, 4, 3, roof_type='brown', wall_type='red')    # Ban Đấu Thầu
draw_building(27, 31, 4, 3, roof_type='blue', wall_type='stone')    # Trùm DNNN Hoàng Gia

# Parked cars
paste_tile(T_CAR_RED, 22, 16)
paste_tile(T_CAR_BLUE, 18, 10)
paste_tile(T_CAR_YELLOW, 5, 28)

# --- ZONE 5: KHU KINH DOANH 2 - PHỐ LỢI ÍCH (Cols 32-47, Rows 0-33) ---
# Bridge / boundary barrier across Boulevard
for by in range(14, 19):
    paste_tile((0, 14), 31, by) # fence/barrier
for bx in range(32, 48):
    for by in range(MAP_H):
        if (bx + by) % 3 == 0:
            paste_tile(T_PLAZA_PAVING, bx, by)

# Buildings inside Khu 2 (under cloud)
draw_building(34, 4, 6, 6, roof_type='gray', wall_type='glass')    # Khu công nghiệp
draw_building(42, 5, 5, 5, roof_type='blue', wall_type='stone')    # Trụ sở Công đoàn
draw_building(34, 18, 6, 5, roof_type='brown', wall_type='red')   # Hội Doanh nhân
draw_building(42, 20, 5, 6, roof_type='orange', wall_type='beige') # Nơi giam giữ Phong

# Scale up 2x for sharp rendering
scaled_w = canvas.width * 2
scaled_h = canvas.height * 2
final_img = canvas.resize((scaled_w, scaled_h), Image.NEAREST)

# Draw semi-transparent cloud over Khu 2 (Cols 31-47)
cloud_overlay = Image.new('RGBA', (scaled_w, scaled_h), (0, 0, 0, 0))
c_draw = ImageDraw.Draw(cloud_overlay)

# Khu 2 Cloud coordinates in scaled px:
k2_x0 = 31 * TILE_SIZE * 2
k2_y0 = 0
k2_x1 = scaled_w
k2_y1 = scaled_h

# Soft fog overlay
c_draw.rectangle([k2_x0, k2_y0, k2_x1, k2_y1], fill=(225, 235, 255, 175))

# Lock Banner in Khu 2
banner_w = 460
banner_h = 90
bx0 = k2_x0 + 40
by0 = scaled_h // 2 - 45
c_draw.rounded_rectangle([bx0, by0, bx0 + banner_w, by0 + banner_h], radius=12, fill=(30, 41, 59, 235), outline=(245, 158, 11, 255), width=3)

final_img = Image.alpha_composite(final_img, cloud_overlay)

# Draw Labels and annotations
draw = ImageDraw.Draw(final_img)

def draw_label(text, x, y, bg_color=(15, 23, 42, 220), border_color=(255, 255, 255, 255), text_color=(255, 255, 255, 255)):
    # Simple bounding box
    pad_x = 10
    pad_y = 6
    # Approx text size
    text_w = len(text) * 7.5
    text_h = 16
    draw.rounded_rectangle([x - pad_x, y - pad_y, x + text_w + pad_x, y + text_h + pad_y], radius=6, fill=bg_color, outline=border_color, width=2)
    draw.text((x, y), text, fill=text_color)

# Add Zone Labels
# 1. Khu Tri thức
draw_label("KHU TRI THUC (Mo san)", 40, 20, bg_color=(16, 185, 129, 230), border_color=(255, 255, 255, 255))
draw_label("Thu Vien", 60, 130, bg_color=(15, 23, 42, 200))
draw_label("Dai Quan Sat", 195, 130, bg_color=(15, 23, 42, 200))
draw_label("Nha Luu Tru", 80, 260, bg_color=(15, 23, 42, 200))

# 2. Toa Thu Thach
draw_label("TOA THU THACH (Quiz Hub)", 430, 30, bg_color=(245, 158, 11, 240), border_color=(255, 255, 255, 255))
draw_label("Angry Birds Quiz (10 Man)", 435, 275, bg_color=(15, 23, 42, 210))

# 3. Quang truong & Spawn
draw_label("QUANG TRUONG & SPAWN POINT", 40, 370, bg_color=(59, 130, 246, 230))
draw_label("Ho So", 60, 460, bg_color=(15, 23, 42, 190))
draw_label("Huy Hieu", 140, 460, bg_color=(15, 23, 42, 190))
draw_label("BXH", 230, 460, bg_color=(15, 23, 42, 190))
draw_label("Cai Dat", 60, 545, bg_color=(15, 23, 42, 190))

# 4. Khu 1 - Pho The Che
draw_label("KHU KINH DOANH 1: PHO THE CHE (Pixel RPG Battle - Mo san)", 60, 600, bg_color=(239, 68, 68, 240))
draw_label("DN Nam Long", 40, 670, bg_color=(15, 23, 42, 200))
draw_label("Startup Tri Viet", 150, 670, bg_color=(15, 23, 42, 200))
draw_label("HTX Bac Ba", 280, 670, bg_color=(15, 23, 42, 200))
draw_label("FDI GlobalTech", 380, 670, bg_color=(15, 23, 42, 200))
draw_label("Ban Dau Thau", 510, 670, bg_color=(15, 23, 42, 200))
draw_label("TRUM: DNNN Hoang Gia", 630, 670, bg_color=(220, 38, 38, 230))

# 5. Khu 2 - Pho Loi Ich (Locked)
draw.text((bx0 + 20, by0 + 20), "KHU 2: PHO LOI ICH (DANG KHOA)", fill=(245, 158, 11, 255))
draw.text((bx0 + 20, by0 + 45), "Dieu kien: Can 3 Huy Hieu The Che de mo!", fill=(226, 232, 240, 255))
draw.text((bx0 + 20, by0 + 65), "Muc tieu: Giai cuu Phong dang bi ket o day!", fill=(248, 113, 113, 255))

out_path = 'docs/city-map-sketch.png'
os.makedirs('docs', exist_ok=True)
final_img.save(out_path)
print(f"Đã tạo thành công bản phác thảo bản đồ thành phố: {out_path} ({scaled_w}x{scaled_h})")
