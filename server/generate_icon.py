"""
生成应用图标
将 SVG 图标转换为 PNG（多种尺寸）
需要安装 Pillow: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("请先安装 Pillow: pip install pillow")
    print("或者手动放置 icon-192.png 和 icon-512.png 到 app/icons/ 目录")
    exit(1)

import os

# 颜色
BG_TOP = (219, 184, 150)   # dbb896
BG_BOTTOM = (166, 120, 80)  # a67850
TEXT_COLOR = (255, 255, 255)


def generate_icon(size, output_path):
    """生成指定尺寸的图标"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 圆角矩形背景（渐变模拟）
    radius = int(size * 0.1875)  # 96/512
    
    # 创建渐变
    for y in range(size):
        ratio = y / size
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * ratio)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * ratio)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # 应用圆角蒙版
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    img.putalpha(mask)
    
    # 文字 "轻"
    draw = ImageDraw.Draw(img)
    
    # 尝试加载中文字体
    font_size = int(size * 0.43)
    font = None
    
    # Windows 常见中文字体
    font_candidates = [
        "C:/Windows/Fonts/msyh.ttc",       # 微软雅黑
        "C:/Windows/Fonts/msyhbd.ttc",     # 微软雅黑粗体
        "C:/Windows/Fonts/simhei.ttf",     # 黑体
        "C:/Windows/Fonts/simsun.ttc",     # 宋体
        "C:/Windows/Fonts/simkai.ttf",     # 楷体
        "/System/Library/Fonts/PingFang.ttc",  # macOS
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",  # Linux
    ]
    
    for font_path in font_candidates:
        if os.path.exists(font_path):
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
    
    if font is None:
        font = ImageFont.load_default()
        print("警告: 未找到中文字体，使用默认字体")
    
    text = "轻"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (size - text_w) // 2 - bbox[0]
    y = int(size * 0.42) - text_h // 2 - bbox[1]
    
    draw.text((x, y), text, fill=TEXT_COLOR, font=font)
    
    # 装饰线
    line_y = int(size * 0.72)
    line_width = int(size * 0.3)
    line_x1 = (size - line_width) // 2
    line_x2 = line_x1 + line_width
    line_color = (*TEXT_COLOR[:3], int(255 * 0.6))
    draw.line([(line_x1, line_y), (line_x2, line_y)], fill=line_color, width=max(2, size//170))
    
    # 保存
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"✓ 生成: {output_path} ({size}x{size})")


def main():
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'app', 'icons')
    icons_dir = os.path.abspath(icons_dir)
    
    sizes = [
        (192, os.path.join(icons_dir, 'icon-192.png')),
        (512, os.path.join(icons_dir, 'icon-512.png')),
    ]
    
    print("生成应用图标...")
    for size, path in sizes:
        generate_icon(size, path)
    
    print(f"\n完成！图标保存在: {icons_dir}")


if __name__ == '__main__':
    main()
