"""生成 Android 图标和启动屏各尺寸"""
from PIL import Image
import os

ANDROID_RES = r"e:\BH\Android\qing\android\app\src\main\res"
ICON_SRC = r"e:\BH\Android\qing\assets\icon.jpg"
SPLASH_SRC = r"e:\BH\Android\qing\assets\splash.jpg"

# App icon sizes for each density
ICON_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Round icon sizes (same as regular)
ROUND_SIZES = ICON_SIZES.copy()

# Splash screen sizes for each density
SPLASH_SIZES = {
    "drawable-mdpi": (320, 480),
    "drawable-hdpi": (480, 800),
    "drawable-xhdpi": (640, 960),
    "drawable-xxhdpi": (960, 1600),
    "drawable-xxxhdpi": (1280, 1920),
}

def generate_icons():
    src = Image.open(ICON_SRC).convert("RGBA")
    for folder, size in ICON_SIZES.items():
        dir_path = os.path.join(ANDROID_RES, folder)
        os.makedirs(dir_path, exist_ok=True)
        icon = src.resize((size, size), Image.LANCZOS)
        icon.save(os.path.join(dir_path, "ic_launcher.png"))
        icon.save(os.path.join(dir_path, "ic_launcher_round.png"))
        print(f"  {folder}: {size}x{size}")

def generate_splash():
    src = Image.open(SPLASH_SRC).convert("RGBA")
    for folder, (w, h) in SPLASH_SIZES.items():
        dir_path = os.path.join(ANDROID_RES, folder)
        os.makedirs(dir_path, exist_ok=True)
        # Crop/resize to target aspect ratio
        src_ratio = src.width / src.height
        dst_ratio = w / h
        if src_ratio > dst_ratio:
            new_w = int(src.height * dst_ratio)
            left = (src.width - new_w) // 2
            cropped = src.crop((left, 0, left + new_w, src.height))
        else:
            new_h = int(src.width / dst_ratio)
            top = (src.height - new_h) // 2
            cropped = src.crop((0, top, src.width, top + new_h))
        splash = cropped.resize((w, h), Image.LANCZOS)
        splash.save(os.path.join(dir_path, "splash.png"))
        print(f"  {folder}: {w}x{h}")

def generate_foreground():
    """生成自适应图标前景"""
    src = Image.open(ICON_SRC).convert("RGBA")
    fg_size = 432  # xxxhdpi
    for folder, size in ICON_SIZES.items():
        scale = size / 48
        fg_target = int(108 * scale)
        dir_path = os.path.join(ANDROID_RES, folder)
        if not os.path.exists(dir_path):
            continue
        fg = src.resize((fg_target, fg_target), Image.LANCZOS)
        fg_path = os.path.join(dir_path, "ic_launcher_foreground.png")
        fg.save(fg_path)

if __name__ == "__main__":
    print(">>> 生成 App 图标...")
    generate_icons()
    print(">>> 生成启动屏...")
    generate_splash()
    print(">>> 生成自适应图标前景...")
    generate_foreground()
    print(">>> 完成!")
