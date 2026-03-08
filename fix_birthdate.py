import pandas as pd
import os

input_file = r'h:\내 드라이브\선거 테스트\선거인명부\선거인명부0306_알파벳제거_완료.xlsx'
output_file = r'h:\내 드라이브\선거 테스트\선거인명부\선거인명부0306_생년월일보정_완료.xlsx'

if not os.path.exists(input_file):
    print(f"Error: Input file not found: {input_file}")
    exit(1)

try:
    # 1. Load Excel
    print("Loading file...")
    # Read everything as object/string to prevent further loss of leading zeros
    df = pd.read_excel(input_file, dtype={'Birthdate': str, 'Phone': str})
    
    # 2. Convert Birthdate to string and fill 0s
    print("Correcting Birthdate format...")
    # Remove any decimal points if they were imported from numbers (e.g. "950101.0")
    df['Birthdate'] = df['Birthdate'].astype(str).str.split('.').str[0]
    
    # Fill leading zeros (max 6 digits)
    df['Birthdate'] = df['Birthdate'].apply(lambda x: x.zfill(6) if x != 'nan' else '')
    
    # 3. Validation Check
    invalid_dates = df[df['Birthdate'].str.len() != 6]['Birthdate'].unique()
    if len(invalid_dates) > 0 and not (len(invalid_dates) == 1 and invalid_dates[0] == ''):
        print(f"Warning: Found dates that are not 6 digits: {invalid_dates}")
    
    # 4. Save
    print(f"Saving to {output_file}...")
    df.to_excel(output_file, index=False)
    print("Successfully processed!")
    
    # Show samples
    print("\nCorrected samples (first 5):")
    print(df[['Name', 'Birthdate']].head())

except Exception as e:
    print(f"An error occurred: {e}")
    exit(1)
