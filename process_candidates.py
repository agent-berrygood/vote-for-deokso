import pandas as pd
import math
import os

volunteer_file = r"h:\내 드라이브\선거 테스트\당회보고용\봉사정보\봉사정보_0304.xls"
deacon_file = r"h:\내 드라이브\선거 테스트\당회보고용\안수집사 후보 02.20.xlsx"
elder_file = r"h:\내 드라이브\선거 테스트\당회보고용\장로후보02.20.xls.xlsx"
gwonsa_file = r"h:\내 드라이브\선거 테스트\당회보고용\권사후보02.20.xlsx"

out_dir = r"c:\Users\E\Desktop\Antigravity\vote"

def format_years(years):
    years = sorted(list(set(years)))
    if not years: return ""
    ranges = []
    start = years[0]
    end = years[0]
    for y in years[1:]:
        if y == end + 1:
            end = y
        else:
            if start == end:
                ranges.append(f"{str(start)[-2:]}")
            else:
                ranges.append(f"{str(start)[-2:]}~{str(end)[-2:]}")
            start = y
            end = y
    if start == end:
        ranges.append(f"{str(start)[-2:]}")
    else:
        ranges.append(f"{str(start)[-2:]}~{str(end)[-2:]}")
    return ", ".join(ranges)

print("HTML 테이블 로드 중...")
tables = pd.read_html(volunteer_file, encoding='utf-8')
df_vol = tables[0]

# 1열과 2열 레벨의 MultiIndex 컬럼일 경우 대비
# 컬럼 중 연도 컬럼 찾기 (숫자 4자리)
year_cols = []
for col in df_vol.columns:
    # Handle MultiIndex
    if type(col) is tuple:
        col_str = str(col[-1]).strip()
    else:
        col_str = str(col).strip()
        
    if '.' in col_str:
        col_str = col_str.split('.')[0]
    if col_str.isdigit() and len(col_str) == 4:
        year_cols.append(col)

print(f"발견된 연도 컬럼들: {year_cols}")

person_vols = {}

for idx, row in df_vol.iterrows():
    # MultiIndex 대응 (보통 이름은 최상위 또는 마지막 레벨)
    def_get = lambda r, k: r.get(k) if type(k) is not tuple else r.loc[k] if k in r.index else None
    
    # Try different possible column names for Name
    name = None
    dept = None
    for c in df_vol.columns:
        c_str = str(c[-1] if type(c) is tuple else c).strip()
        if '이름' in c_str or '성명' in c_str:
            name = str(row[c]).strip()
        if '봉사부서' in c_str:
            dept = str(row[c]).strip()

    if not name or name == 'nan': continue
    if not dept or dept == 'nan': dept = '알수없음'
        
    if '[' in dept and ']' in dept:
        dept = dept.split(']')[-1].strip()
        
    if name not in person_vols:
        person_vols[name] = {'depts': {}, 'all_years': set()}
        
    for y_col in year_cols:
        val = row[y_col]
        if pd.notna(val) and str(val).strip() != '' and str(val).lower() != 'nan':
            try:
                y_str = str(y_col[-1] if type(y_col) is tuple else y_col).strip()
                year_val = int(y_str.split('.')[0].strip())
                if dept not in person_vols[name]['depts']:
                    person_vols[name]['depts'][dept] = set()
                person_vols[name]['depts'][dept].add(year_val)
                person_vols[name]['all_years'].add(year_val)
            except:
                pass

processed_vol_info = {}

for name, data in person_vols.items():
    if len(data['all_years']) < 3:
        processed_vol_info[name] = {'eligible': False, 'info': ''}
        continue
        
    dept_max_year = []
    for d, yrs in data['depts'].items():
        if yrs:
            dept_max_year.append((max(yrs), d, list(yrs)))
            
    dept_max_year.sort(key=lambda x: x[0], reverse=True)
    top_3 = dept_max_year[:3]
    
    info_strs = []
    for _, d, yrs in top_3:
        yr_str = format_years(yrs)
        info_strs.append(f"{d}({yr_str})")
        
    volunteer_info_str = ", ".join(info_strs)
    processed_vol_info[name] = {'eligible': True, 'info': volunteer_info_str}

print(f"총 {len(processed_vol_info)}명의 봉사정보 처리 및 필터링 완료")

def process_candidate_file(file_path, position_name, out_filename):
    print(f"처리중: {position_name} 파일...")
    try:
        # Check if file has xl/worksheets issue in openpyxl, pandas can use 'openpyxl' for xlsx and 'xlrd' for xls
        engine = 'openpyxl' if str(file_path).endswith('.xlsx') else 'xlrd'
        df = pd.read_excel(file_path, engine=engine)
        
        name_col = None
        for col in df.columns:
            c_str = str(col).lower()
            if '이름' in c_str or '성명' in c_str or 'name' in c_str:
                name_col = col
                break
                
        if not name_col:
            print(f"{position_name} 파일에서 이름 컬럼을 찾을 수 없습니다.")
            return
            
        if 'volunteerInfo' not in df.columns:
            df['volunteerInfo'] = ''
            
        valid_indices = []
        for idx, row in df.iterrows():
            c_name = str(row[name_col]).strip()
            
            p_info = processed_vol_info.get(c_name)
            if p_info and p_info['eligible']:
                df.at[idx, 'volunteerInfo'] = p_info['info']
                valid_indices.append(idx)
            else:
                pass
                
        df_valid = df.loc[valid_indices].copy()
        
        out_path = os.path.join(out_dir, f"{out_filename}")
        df_valid.to_excel(out_path, index=False, engine='openpyxl')
        print(f"-> {position_name} 처리완료! (원본 {len(df)}명 -> 적격자 {len(df_valid)}명) 저장결과: {out_filename}")
        
    except Exception as e:
        print(f"{position_name} 처리 중 오류: {e}")

process_candidate_file(deacon_file, "안수집사 후보", "가공완료_안수집사후보.xlsx")
process_candidate_file(elder_file, "장로 후보", "가공완료_장로후보.xlsx")
process_candidate_file(gwonsa_file, "권사 후보", "가공완료_권사후보.xlsx")
