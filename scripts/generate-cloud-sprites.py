#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

out_dir = 'public/assets/clouds'
os.makedirs(out_dir, exist_ok=True)

# Kenney-compatible color palette for clouds
C_OUTLINE = (51, 65, 85, 255)     # #334155 dark slate outline
C_SHADOW = (203, 213, 225, 255)   # #cbd5e1 cloud shadow
C_BODY = (241, 245, 249, 255)     # #f1f5f9 cloud body
C_HIGHLIGHT = (255, 255, 255, 255) # white highlight

def create_pixel_cloud(w, h, circles):
    """
    circles: list of (cx, cy, r)
    """
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Draw outline circles
    for cx, cy, r in circles:
        draw.ellipse([cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1], fill=C_OUTLINE)

    # 2. Draw shadow / lower half
    for cx, cy, r in circles:
        draw.ellipse([cx - r, cy - r + 2, cx + r, cy + r + 2], fill=C_SHADOW)

    # 3. Draw main body
    for cx, cy, r in circles:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=C_BODY)

    # 4. Top highlight
    for cx, cy, r in circles:
        draw.ellipse([cx - r + 2, cy - r + 1, cx + r - 2, cy - 1], fill=C_HIGHLIGHT)

    return img

# 1. Large Cloud (96x48)
c_large = create_pixel_cloud(96, 48, [
    (24, 28, 16),
    (48, 22, 22),
    (72, 28, 16),
    (38, 30, 14),
    (58, 30, 14)
])
c_large.save(os.path.join(out_dir, 'cloud_large.png'))

# 2. Medium Cloud (64x32)
c_med = create_pixel_cloud(64, 32, [
    (18, 20, 11),
    (32, 16, 15),
    (46, 20, 11),
    (26, 22, 10),
    (38, 22, 10)
])
c_med.save(os.path.join(out_dir, 'cloud_medium.png'))

# 3. Small Cloud (40x24)
c_small = create_pixel_cloud(40, 24, [
    (12, 15, 8),
    (20, 12, 11),
    (28, 15, 8)
])
c_small.save(os.path.join(out_dir, 'cloud_small.png'))

print("Đã tạo thành công các sprite mây trong public/assets/clouds/")
