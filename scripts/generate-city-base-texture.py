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

canvas = Image.new('RGBA', (MAP_W * TILE_SIZE, MAP_H * TILE_SIZE), (40, 140, 50, 255))

T_GRASS = (0, 24)
T_GRASS_FLOWER = (1, 24)
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
T_CAR_RED = (34, 15)
T_CAR_BLUE = (35, 15)
T_CAR_YELLOW = (36, 15)

for y in range(MAP_H):
    for x in range(MAP_W):
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

# 1. Main Roads
fill_rect(T_SIDEWALK, 0, 14, MAP_W - 1, 14)
fill_rect(T_ROAD_ASPHALT, 0, 15, MAP_W - 1, 17)
for x in range(0, MAP_W):
    paste_tile(T_ROAD_H_DASH, x, 16)
fill_rect(T_SIDEWALK, 0, 18, MAP_W - 1, 18)

fill_rect(T_SIDEWALK, 0, 27, 30, 27)
fill_rect(T_ROAD_ASPHALT, 0, 28, 30, 30)
for x in range(0, 31):
    paste_tile(T_ROAD_H_DASH, x, 29)
fill_rect(T_SIDEWALK, 0, 31, 30, 31)

fill_rect(T_SIDEWALK, 16, 0, 16, MAP_H - 1)
fill_rect(T_ROAD_ASPHALT, 17, 0, 19, MAP_H - 1)
for y in range(0, MAP_H):
    paste_tile(T_ROAD_V_DASH, 18, y)
fill_rect(T_SIDEWALK, 20, 0, 20, MAP_H - 1)

for y in range(15, 18):
    paste_tile(T_CROSSWALK_H, 15, y)
    paste_tile(T_CROSSWALK_H, 21, y)
for x in range(17, 20):
    paste_tile(T_CROSSWALK_V, x, 13)
    paste_tile(T_CROSSWALK_V, x, 19)

def draw_building(x, y, w, h, roof_type='brown', wall_type='red', has_door=True):
    r_cols = {'brown': 0, 'gray': 4, 'blue': 12, 'orange': 8, 'red': 0}.get(roof_type, 0)
    w_cols = {'red': 0, 'beige': 4, 'glass': 9, 'stone': 1}.get(wall_type, 0)
    
    for ry in range(2):
        for rx in range(w):
            col_offset = 0 if rx == 0 else (2 if rx == w - 1 else 1)
            paste_tile((r_cols + col_offset, ry), x + rx, y + ry)
    for wy in range(2, h):
        for wx in range(w):
            col_offset = 0 if wx == 0 else (2 if wx == w - 1 else 1)
            paste_tile((w_cols + col_offset, 5), x + wx, y + wy)
            if wy == 2 and 0 < wx < w - 1 and wx % 2 == 1:
                paste_tile((0, 16), x + wx, y + wy)
    if has_door:
        door_x = x + w // 2
        paste_tile((2, 17), door_x, y + h - 1)

# Zone 1: Khu Tri Thuc
fill_rect(T_PLAZA_PAVING, 2, 2, 15, 13)
draw_building(3, 3, 5, 4, roof_type='blue', wall_type='stone')
draw_building(10, 3, 4, 4, roof_type='gray', wall_type='glass')
draw_building(4, 9, 6, 4, roof_type='brown', wall_type='beige')

paste_tile(T_TREE_TOP, 12, 9)
paste_tile(T_TREE_BOTTOM, 12, 10)
paste_tile(T_TREE_TOP, 14, 9)
paste_tile(T_TREE_BOTTOM, 14, 10)
paste_tile(T_BENCH, 11, 10)
paste_tile(T_LAMP, 2, 13)
paste_tile(T_LAMP, 15, 13)

# Zone 2: Toa Thu Thach
fill_rect(T_PLAZA_PAVING, 21, 2, 30, 13)
draw_building(22, 4, 8, 8, roof_type='orange', wall_type='glass')
paste_tile(T_LAMP, 21, 12)
paste_tile(T_LAMP, 30, 12)
paste_tile(T_BENCH, 21, 8)
paste_tile(T_BENCH, 30, 8)
paste_tile(T_TREE_TOP, 21, 4)
paste_tile(T_TREE_BOTTOM, 21, 5)
paste_tile(T_TREE_TOP, 30, 4)
paste_tile(T_TREE_BOTTOM, 30, 5)

# Zone 3: Plaza & Aux buildings
fill_rect(T_PLAZA_PAVING, 2, 19, 15, 26)
draw_building(3, 20, 3, 3, roof_type='brown', wall_type='beige')
draw_building(7, 20, 3, 3, roof_type='blue', wall_type='stone')
draw_building(11, 20, 3, 3, roof_type='gray', wall_type='glass')
draw_building(3, 24, 4, 3, roof_type='orange', wall_type='red')

paste_tile((11, 14), 10, 24)
paste_tile(T_BENCH, 8, 24)
paste_tile(T_BENCH, 12, 24)

# Zone 4: Khu 1
draw_building(2, 31, 4, 3, roof_type='red', wall_type='red')
draw_building(7, 31, 4, 3, roof_type='blue', wall_type='glass')
draw_building(12, 31, 4, 3, roof_type='orange', wall_type='beige')
draw_building(17, 31, 4, 3, roof_type='gray', wall_type='stone')
draw_building(22, 31, 4, 3, roof_type='brown', wall_type='red')
draw_building(27, 31, 4, 3, roof_type='blue', wall_type='stone')

paste_tile(T_CAR_RED, 22, 16)
paste_tile(T_CAR_BLUE, 18, 10)
paste_tile(T_CAR_YELLOW, 5, 28)

# Zone 5: Khu 2
for by in range(14, 19):
    paste_tile((0, 14), 31, by)
for bx in range(32, 48):
    for by in range(MAP_H):
        if (bx + by) % 3 == 0:
            paste_tile(T_PLAZA_PAVING, bx, by)

draw_building(34, 4, 6, 6, roof_type='gray', wall_type='glass')
draw_building(42, 5, 5, 5, roof_type='blue', wall_type='stone')
draw_building(34, 18, 6, 5, roof_type='brown', wall_type='red')
draw_building(42, 20, 5, 6, roof_type='orange', wall_type='beige')

scaled_img = canvas.resize((canvas.width * 2, canvas.height * 2), Image.NEAREST)

out_dir = 'public/assets/maps'
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, 'city-base.png')
scaled_img.save(out_file)
print(f"Đã xuất texture nền thành phố không nhãn vào: {out_file} ({scaled_img.width}x{scaled_img.height})")
