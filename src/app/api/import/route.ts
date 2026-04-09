import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createMemberAction } from '@/app/actions/data';

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'voters_export.json');
    
    if (!fs.existsSync(jsonPath)) {
        return NextResponse.json({ success: false, error: "voters_export.json 파일을 찾을 수 없습니다." });
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let count = 0;
    let errors = [];
    
    for (const voter of data) {
       // Data Connect SDK를 통해 새 SQL Member 테이블에 인서트합니다.
       const res = await createMemberAction({
         name: voter.name || '알수없음',
         phone: voter.phone || '',
         birthdate: voter.birthdate || '',
         originalId: voter.id || ''
       });
       
       if (res.success) {
           count++;
       } else {
           errors.push(`'${voter.name}': ${res.error}`);
       }
    }
    
    return NextResponse.json({ 
        success: true, 
        message: "마이그레이션 종료",
        totalImported: count, 
        errorsList: errors 
    });
    
  } catch(e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
