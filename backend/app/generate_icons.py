import os
import sys

def setup_and_generate():
    # Install pillow if not present
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("Pillow not found, installing pillow...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
        from PIL import Image, ImageDraw

    icon_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "public", "icons")
    os.makedirs(icon_dir, exist_ok=True)

    sizes = [192, 512]
    for size in sizes:
        # Create an image with orange and blue gradient
        img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a beautiful circle gradient
        draw.ellipse([size * 0.1, size * 0.1, size * 0.9, size * 0.9], fill=(249, 115, 22, 255)) # Orange
        draw.ellipse([size * 0.25, size * 0.25, size * 0.75, size * 0.75], fill=(79, 70, 229, 255)) # Royal Blue/Purple
        
        # Save icon
        img.save(os.path.join(icon_dir, f"icon-{size}.png"), "PNG")
        print(f"Generated PWA icon: icon-{size}.png")

if __name__ == "__main__":
    setup_and_generate()
