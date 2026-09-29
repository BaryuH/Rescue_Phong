#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

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

# Iron Fence tiles
FENCE_H = (6, 16)
FENCE_V = (5, 17)
FENCE_TL = (4, 15)
FENCE_TR = (7, 15)
FENCE_BL = (4, 16)
FENCE_BR = (7, 16)
FENCE_GATE = (5, 16)

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
    for ry in range(2):
        for rx in range(w):
            col_offset = 0 if rx == 0 else (2 if rx == w - 1 else 1)
            paste_tile((r_cols + col_offset, ry), x + rx, y + ry)
    for wy in range(2, h):
        for wx in range(w):
            col_offset = 0 if wx == 0 else (2 if wx == w - 1 else 1)
            paste_tile((w_cols + col_offset, 5), x + wx, y + wy)
            if wy == 2 and 0 < wx < w - 1 and (wx % 2 == 1 or w <= 4):
                paste_tile((0, 16), x + wx, y + wy)
    if has_door:
        door_x = x + w // 2
        paste_tile((2, 17), door_x, y + h - 1)

# Roads
fill_rect(T_SIDEWALK, 16, 0, 16, MAP_H - 1)
fill_rect(T_ROAD_ASPHALT, 17, 0, 19, MAP_H - 1)
for y in range(0, MAP_H):
    paste_tile(T_ROAD_V_DASH, 18, y)
fill_rect(T_SIDEWALK, 20, 0, 20, MAP_H - 1)

fill_rect(T_SIDEWALK, 0, 13, MAP_W - 1, 13)
fill_rect(T_ROAD_ASPHALT, 0, 14, MAP_W - 1, 16)
for x in range(0, MAP_W):
    paste_tile(T_ROAD_H_DASH, x, 15)
fill_rect(T_SIDEWALK, 0, 17, MAP_W - 1, 17)

fill_rect(T_SIDEWALK, 0, 26, 30, 26)
fill_rect(T_ROAD_ASPHALT, 0, 27, 30, 29)
for x in range(0, 31):
    paste_tile(T_ROAD_H_DASH, x, 28)
fill_rect(T_SIDEWALK, 0, 30, 30, 30)

for y in range(14, 17):
    paste_tile(T_CROSSWALK_H, 15, y)
    paste_tile(T_CROSSWALK_H, 21, y)
for x in range(17, 20):
    paste_tile(T_CROSSWALK_V, x, 12)
    paste_tile(T_CROSSWALK_V, x, 18)
    paste_tile(T_CROSSWALK_V, x, 25)

# Parcels with Fences
# 1. Khu Tri Thuc
draw_fenced_perimeter(1, 1, 15, 12, gate_x1=7, gate_x2=9, gate_side='bottom')
fill_rect(T_PLAZA_PAVING, 7, 7, 9, 12)
fill_rect(T_PLAZA_PAVING, 4, 7, 12, 8)
draw_building(2, 3, 5, 4, roof_type='blue', wall_type='stone')
draw_building(10, 3, 5, 4, roof_type='gray', wall_type='glass')
draw_building(5, 9, 6, 3, roof_type='brown', wall_type='beige')
paste_tile(T_TREE_TOP, 8, 3)
paste_tile(T_TREE_BOTTOM, 8, 4)
paste_tile(T_BENCH, 4, 8)
paste_tile(T_BENCH, 11, 8)

# 2. Toa Thu Thach
draw_fenced_perimeter(21, 1, 30, 12, gate_x1=24, gate_x2=27, gate_side='bottom')
fill_rect(T_PLAZA_PAVING, 22, 9, 29, 12)
draw_building(23, 2, 7, 7, roof_type='orange', wall_type='glass')
paste_tile(T_LAMP, 23, 12)
paste_tile(T_LAMP, 28, 12)

# 3. Quang truong
draw_fenced_perimeter(1, 18, 15, 25, gate_x1=7, gate_x2=9, gate_side='bottom')
fill_rect(T_PLAZA_PAVING, 2, 19, 14, 24)
paste_tile(T_FOUNTAIN, 8, 21)
paste_tile(T_BENCH, 6, 21)
paste_tile(T_BENCH, 10, 21)
draw_building(2, 19, 4, 3, roof_type='brown', wall_type='beige')
draw_building(11, 19, 4, 3, roof_type='blue', wall_type='stone')
draw_building(2, 22, 4, 3, roof_type='gray', wall_type='glass')
draw_building(11, 22, 4, 3, roof_type='orange', wall_type='red')

# 4. Pho The Che
for x in range(1, 31):
    paste_tile(FENCE_H, x, 31)
draw_building(1, 31, 4, 3, roof_type='red', wall_type='red')
draw_building(6, 31, 4, 3, roof_type='blue', wall_type='glass')
draw_building(11, 31, 4, 3, roof_type='orange', wall_type='beige')
draw_building(16, 31, 4, 3, roof_type='gray', wall_type='stone')
draw_building(21, 31, 4, 3, roof_type='brown', wall_type='red')
draw_building(26, 31, 5, 3, roof_type='blue', wall_type='stone')

# 5. Khu 2
for by in range(0, MAP_H):
    if by in [14, 15, 16]:
        paste_tile(FENCE_GATE, 31, by)
    else:
        paste_tile(FENCE_V, 31, by)

draw_building(34, 3, 6, 5, roof_type='gray', wall_type='glass')
draw_building(42, 4, 5, 5, roof_type='blue', wall_type='stone')
draw_building(34, 19, 6, 5, roof_type='brown', wall_type='red')
draw_building(42, 20, 5, 6, roof_type='orange', wall_type='beige')

scaled_img = canvas.resize((canvas.width * 2, canvas.height * 2), Image.NEAREST)

# Fog over Khu 2
k2_x0 = 31 * TILE_SIZE * 2
cloud_overlay = Image.new('RGBA', scaled_img.size, (0, 0, 0, 0))
c_draw = ImageDraw.Draw(cloud_overlay)
c_draw.rectangle([k2_x0, 0, scaled_img.width, scaled_img.height], fill=(225, 235, 255, 175))

# Lock banner
banner_w = 420
banner_h = 90
bx0 = k2_x0 + 40
by0 = scaled_img.height // 2 - 45
c_draw.rounded_rectangle([bx0, by0, bx0 + banner_w, by0 + banner_h], radius=12, fill=(30, 41, 59, 235), outline=(245, 158, 11, 255), width=3)

final_img = Image.alpha_composite(scaled_img, cloud_overlay)
draw = ImageDraw.Draw(final_img)

draw.text((bx0 + 20, by0 + 20), "KHU 2: PHO LOI ICH (DANG KHOA)", fill=(245, 158, 11, 255))
draw.text((bx0 + 20, by0 + 45), "Dieu kien: Can 3 Huy Hieu The Che", fill=(226, 232, 240, 255))
draw.text((bx0 + 20, by0 + 65), "Muc tieu: Giai cuu Phong tai day!", fill=(248, 113, 113, 255))

out_path = 'docs/city-map-sketch.png'
final_img.save(out_path)
print(f"Da xuat ban phac thao moi: {out_path}")
