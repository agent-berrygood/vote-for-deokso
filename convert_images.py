from PIL import Image
import os

def convert_png_to_jpg(input_path):
    output_path = os.path.splitext(input_path)[0] + ".jpg"
    try:
        # PNG 이미지 열기
        with Image.open(input_path) as img:
            # RGBA 모드인 경우 (투명도 포함) 흰색 배경 생성
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                background = Image.new('RGB', img.size, (255, 255, 255))
                # 투명도 정보를 확인하여 마스크로 사용
                if img.mode == 'RGBA':
                    background.paste(img, (0, 0), img)
                else:
                    background.paste(img.convert('RGBA'), (0, 0), img.convert('RGBA'))
                img = background
            else:
                img = img.convert('RGB')
            
            # JPG 형식으로 저장
            img.save(output_path, "JPEG", quality=95)
            print(f"변환 완료: {input_path} -> {output_path}")
            return True
    except Exception as e:
        print(f"변환 실패 ({input_path}): {e}")
        return False

if __name__ == "__main__":
    files_to_convert = [
        r"j:\내 드라이브\선거 테스트\당회보고용\0311사진추가\김민경A.png",
        r"j:\내 드라이브\선거 테스트\당회보고용\0311사진추가\한지연.png"
    ]
    
    for file_path in files_to_convert:
        convert_png_to_jpg(file_path)
