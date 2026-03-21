from rembg import remove
from PIL import Image
import io

input_path = "h:/내 드라이브/선거 테스트/최종후보/사진변경0312/안보경.jpg"
output_path = "C:/Users/E/Desktop/Antigravity/vote/public/images/candidates/안보경.jpg"

with open(input_path, "rb") as f:
    input_data = f.read()

output_data = remove(input_data)

fg = Image.open(io.BytesIO(output_data)).convert("RGBA")

bg = Image.new("RGB", fg.size, (255, 255, 255))
bg.paste(fg, mask=fg.split()[3])

bg.save(output_path, "JPEG", quality=95)
print(f"Done: {output_path}")
