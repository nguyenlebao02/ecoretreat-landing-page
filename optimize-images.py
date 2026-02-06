"""
Image Optimization Script for Eco Retreat Landing Page
Compress large images to improve page load speed
"""

from PIL import Image
import os
from pathlib import Path

def optimize_image(input_path, output_path, quality=85, max_width=1920):
    """
    Optimize image by resizing and compressing

    Args:
        input_path: Path to input image
        output_path: Path to save optimized image
        quality: JPEG quality (1-100)
        max_width: Maximum width in pixels
    """
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Resize if width > max_width
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            # Save with optimization
            img.save(output_path, 'JPEG', quality=quality, optimize=True, progressive=True)

            # Get file sizes
            original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
            new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            saved = ((original_size - new_size) / original_size) * 100

            print(f"[OK] {os.path.basename(input_path)}")
            print(f"   Original: {original_size:.2f}MB -> Optimized: {new_size:.2f}MB")
            print(f"   Saved: {saved:.1f}%\n")

            return True
    except Exception as e:
        print(f"[ERROR] Processing {input_path}: {e}")
        return False

def main():
    assets_dir = Path("assets/images")

    # Images to optimize (>1MB)
    large_images = [
        "park-villa.png",
        "hero-rung-mai.jpg",
        "rung-mai-3.jpg",
        "rung-mai-4.jpg",
        "rung-mai-5.jpg",
        "rung-mai-6.jpg",
        "rung-mai-7.jpg",
        "clubhouse.jpg",
        "clubhouse-1.jpg",
        "clubhouse-2.jpg",
        "clubhouse-3.jpg",
        "rung-mai-2.jpg"
    ]

    print("Starting Image Optimization...\n")

    optimized_count = 0
    total_original = 0
    total_new = 0

    for img_name in large_images:
        input_path = assets_dir / img_name

        if not input_path.exists():
            print(f"[SKIP] {img_name} (not found)")
            continue

        # Create output path (replace extension with .jpg)
        output_name = img_name.replace('.png', '.jpg')
        output_path = assets_dir / output_name

        # Get original size
        original_size = os.path.getsize(input_path) / (1024 * 1024)
        total_original += original_size

        # Optimize
        if optimize_image(input_path, output_path, quality=85, max_width=1920):
            optimized_count += 1
            new_size = os.path.getsize(output_path) / (1024 * 1024)
            total_new += new_size

            # Delete original PNG if converted to JPG
            if img_name.endswith('.png') and output_name.endswith('.jpg'):
                os.remove(input_path)
                print(f"   [DELETE] Removed original PNG\n")

    # Summary
    print("=" * 50)
    print(f"[SUCCESS] Optimization Complete!")
    print(f"[STATS] Files optimized: {optimized_count}/{len(large_images)}")
    print(f"[SIZE] Total size: {total_original:.2f}MB -> {total_new:.2f}MB")
    print(f"[SAVED] {total_original - total_new:.2f}MB ({((total_original - total_new) / total_original * 100):.1f}%)")
    print("=" * 50)

if __name__ == "__main__":
    main()
