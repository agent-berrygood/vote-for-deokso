from PIL import Image
import os
import glob

def convert_png_to_jpg(input_path):
    # 파일명이 이미 .jpg인 경우 건너뜀 (이미 변환된 파일 등)
    if input_path.lower().endswith('.jpg') or input_path.lower().endswith('.jpeg'):
        return None
        
    output_path = os.path.splitext(input_path)[0] + ".jpg"
    try:
        with Image.open(input_path) as img:
            # RGBA 모드인 경우 흰색 배경 생성
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, (0, 0), img)
                else:
                    background.paste(img.convert('RGBA'), (0, 0), img.convert('RGBA'))
                img = background
            else:
                img = img.convert('RGB')
            
            img.save(output_path, "JPEG", quality=95)
            return output_path
    except Exception as e:
        print(f"변환 실패 ({input_path}): {e}")
        return None

if __name__ == "__main__":
    directory = r"j:\내 드라이브\선거 테스트\당회보고용\0311사진추가"
    # 모든 png, PNG 파일 찾기
    png_files = glob.glob(os.path.join(directory, "*.png")) + glob.glob(os.path.join(directory, "*.PNG"))
    
    print(f"찾은 PNG 파일 개수: {len(png_files)}")
    
    converted_count = 0
    for file_path in png_files:
        result = convert_png_to_jpg(file_path)
        if result:
            print(f"변환 완료: {os.path.basename(file_path)} -> {os.path.basename(result)}")
            converted_count += 1
            
    print(f"총 {converted_count}개의 파일이 변환되었습니다.")
