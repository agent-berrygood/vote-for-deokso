import pandas as pd
import os

template_file = r"h:\내 드라이브\선거 테스트\당회보고용\안수집사_업로드용.xlsx"
target_dir = r"h:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업"
files_to_fix = [
    "가공완료_권사후보.xlsx",
    "가공완료_안수집사후보.xlsx",
    "가공완료_장로후보.xlsx"
]

print("Reading template...")
df_template = pd.read_excel(template_file, engine='openpyxl')
template_cols = df_template.columns.tolist()
print(f"Template columns: {template_cols}")

for fname in files_to_fix:
    f_path = os.path.join(target_dir, fname)
    if not os.path.exists(f_path):
        print(f"File not found: {f_path}")
        continue
        
    print(f"Processing: {fname}")
    df_target = pd.read_excel(f_path, engine='openpyxl')
    target_cols = df_target.columns.tolist()
    
    # 1. Map columns if they have different casing/naming
    rename_map = {}
    for t_col in template_cols:
        for c_col in target_cols:
            if t_col.lower().replace(' ', '') == c_col.lower().replace(' ', ''):
                if t_col != c_col:
                    rename_map[c_col] = t_col
    
    # Force rename known problematic columns if not caught
    if 'volunteerInfo' in target_cols and 'VolunteerInfo' not in target_cols:
        rename_map['volunteerInfo'] = 'VolunteerInfo'
    if 'profileDesc' in target_cols and 'ProfileDesc' not in target_cols:
        rename_map['profileDesc'] = 'ProfileDesc'

    if rename_map:
        df_target.rename(columns=rename_map, inplace=True)
        
    # 2. Add missing columns from template
    for col in template_cols:
        if col not in df_target.columns:
            df_target[col] = ''
            
    # 3. Ensure we only keep template columns and in exactly the same order
    df_fixed = df_target[template_cols].copy()
    
    # 4. Save
    df_fixed.to_excel(f_path, index=False, engine='openpyxl')
    print(f"-> Saved: {f_path}")

print("Done.")
