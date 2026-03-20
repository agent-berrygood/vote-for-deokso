from PIL import Image
import os

def convert_png_to_jpg_white_bg(source_path, target_path):
    try:
        # 이미지 열기
        with Image.open(source_path) as img:
            # RGBA인 경우 배경을 흰색으로 채움
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
                img = background
            else:
                # RGB로 변환 (이미 RGB인 경우에도 안전하게 수행)
                img = img.convert('RGB')
            
            # JPG로 저장
            img.save(target_path, 'JPEG', quality=95)
            print(f"Success: {source_path} -> {target_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    source = r"h:\내 드라이브\선거 테스트\최종후보\사진변경0312\홍은혜.png"
    # 기존 파일이 홍은혜A.jpg이므로 여기에 덮어씌웁니다.
    target = r"c:\Users\E\Desktop\Antigravity\vote\public\images\candidates\홍은혜A.jpg"
    
    # 디렉토리 존재 확인
    if not os.path.exists(os.path.dirname(target)):
        os.makedirs(os.path.dirname(target))
        
    convert_png_to_jpg_white_bg(source, target)
