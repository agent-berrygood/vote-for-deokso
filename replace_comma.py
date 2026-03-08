import pandas as pd
import re
import os

target_dir = r"h:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업"
files_to_fix = [
    "가공완료_권사후보.xlsx",
    "가공완료_안수집사후보.xlsx",
    "가공완료_장로후보.xlsx"
]

def replace_dept_comma(text):
    """괄호 바깥의 쉼표만 줄바꿈으로 치환 (괄호 안 쉼표는 유지)"""
    if pd.isna(text): return ''
    text = str(text)
    # 이미 줄바꿈이 들어간 경우 원본 복구: 줄바꿈을 다시 쉼표로 되돌린 후 재처리
    text = text.replace('\n', ', ')
    
    result = []
    depth = 0
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '(':
            depth += 1
            result.append(ch)
        elif ch == ')':
            depth -= 1
            result.append(ch)
        elif ch == ',' and depth == 0:
            # 괄호 바깥 쉼표 -> 줄바꿈
            result.append('\n')
            # 쉼표 뒤 공백 건너뛰기
            if i + 1 < len(text) and text[i + 1] == ' ':
                i += 1
        else:
            result.append(ch)
        i += 1
    return ''.join(result)

for fname in files_to_fix:
    f_path = os.path.join(target_dir, fname)
    if not os.path.exists(f_path):
        print(f"Not found: {f_path}")
        continue
    
    df = pd.read_excel(f_path, engine='openpyxl')
    
    if 'VolunteerInfo' in df.columns:
        df['VolunteerInfo'] = df['VolunteerInfo'].apply(replace_dept_comma)
        
    df.to_excel(f_path, index=False, engine='openpyxl')
    # 샘플 출력
    sample = df['VolunteerInfo'].dropna().head(2).tolist()
    print(f"Updated: {fname}")
    for s in sample:
        print(f"  예시: {repr(s)}")
