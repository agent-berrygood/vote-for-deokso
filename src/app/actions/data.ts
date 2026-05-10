'use server';

import { revalidatePath } from 'next/cache';
import '@/lib/firebase'; // Ensure Firebase is initialized on server-side

import { 
    getElectionSettings as getSettingsSDK,
    listCandidatesByRound as listCandidatesSDK,
    listVoters as listVotersSDK,
    listAllCandidates as listAllCandidatesSDK,
    listAuditLogs as listAuditLogsSDK,
    listVoterParticipations as listParticipationsSDK,
    getVoterByInfo as getVoterByInfoSDK,
    getMemberByInfo as getMemberByInfoSDK,
    getMemberByBasicInfo as getMemberByBasicInfoSDK,
    listMembers as listMembersSDK,
    getSurvey as getSurveySDK,
    listSurveyQuestions as listSurveyQuestionsSDK,
    listSurveys as listSurveysSDK,
    listSurveySections as listSurveySectionsSDK,
    getSurveyResponseByMember as getSurveyResponseByMemberSDK,
    submitSurveyResponse as submitSurveyResponseSDK,
    updateSurveyResponse as updateSurveyResponseSDK,
    deleteSurveyResponse as deleteSurveyResponseSDK,
    listSurveyResponsesNoJoin as listSurveyResponsesNoJoinSDK,
    createVoter as createVoterSDK,
    updateVoter as updateVoterSDK,
    deleteVoter as deleteVoterSDK,
    createCandidate as createCandidateSDK,
    updateCandidate as updateCandidateSDK,
    deleteCandidate as deleteCandidateSDK,
    deleteCandidatesByRound as deleteCandidatesByRoundSDK,
    getResultsByRound as getResultsByRoundSDK,
    listCandidatesByPosition as listCandidatesByPositionSDK,
    createAdminLog as createAdminLogSDK,
    createAuditLog as createAuditLogSDK,
    createElection as createElectionSDK,
    listElections as listElectionsSDK,
    updateActiveElection as updateActiveElectionSDK,
    deleteAllCandidates as deleteAllCandidatesSDK,
    deleteAllVoters as deleteAllVotersSDK,
    submitVote as submitVoteSDK,
    createMember as createMemberSDK,
    updateMember as updateMemberSDK,
    deleteMember as deleteMemberSDK,
    updateSystemService as updateSystemServiceSDK,
    createSurvey as createSurveySDK,
    updateSurvey as updateSurveySDK,
    deleteSurvey as deleteSurveySDK,
    createSurveyQuestion as createSurveyQuestionSDK,
    updateSurveyQuestion as updateSurveyQuestionSDK,
    deleteSurveyQuestion as deleteSurveyQuestionSDK,
    createSurveySection as createSurveySectionSDK,
    updateSurveySection as updateSurveySectionSDK,
    getSystemSetting as getSystemSettingSDK,
    deleteSurveySection as deleteSurveySectionSDK
} from '@/lib/dataconnect';


export async function getSystemSettingAction(id: string) {
    try {
        const res = await getSystemSettingSDK({ id });
        const s = res.data.systemSetting;
        return {
            success: true,
            data: {
                activeService: (s?.activeService as 'ELECTION' | 'SURVEY') || 'ELECTION',
                activeSurveyId: s?.activeSurveyId || null,
                activeElectionId: s?.activeElection?.id || null,
            }
        };
    } catch (error) {
        console.error('getSystemSettingAction error:', error);
        return { success: false, error: '시스템 설정을 불러오지 못했습니다.' };
    }
}

// --- Queries ---
export async function getElectionSettingsAction(electionId: string) {
    try {
        const res = await getSettingsSDK({ electionId });
        return { success: true, data: res.data.election };
    } catch (error) {
        console.error('getElectionSettingsAction error:', error);
        return { success: false, error: '선거 설정을 불러오지 못했습니다.' };
    }
}

export async function listCandidatesByRoundAction(electionId: string, position: string, round: number) {
    try {
        const res = await listCandidatesSDK({ electionId, position, round });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('listCandidatesByRoundAction error:', error);
        return { success: false, error: '후보자 목록을 불러오지 못했습니다.' };
    }
}

export async function listVotersAction(electionId: string) {
    try {
        const res = await listVotersSDK({ electionId });
        return { success: true, data: res.data.voters };
    } catch (error) {
        console.error('listVotersAction error:', error);
        return { success: false, error: '선거인 목록을 불러오지 못했습니다.' };
    }
}

export async function listAllCandidatesAction(electionId: string) {
    try {
        const res = await listAllCandidatesSDK({ electionId });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('listAllCandidatesAction error:', error);
        return { success: false, error: '모든 후보자 목록을 불러오지 못했습니다.' };
    }
}

export async function listVoterParticipationsAction(electionId: string) {
    try {
        const res = await listParticipationsSDK({ electionId });
        return { success: true, data: res.data.voterParticipations };
    } catch (error) {
        console.error('listVoterParticipationsAction error:', error);
        return { success: false, error: '투표 참여 현황을 불러오지 못했습니다.' };
    }
}

export async function listAuditLogsAction(electionId: string) {
    try {
        const res = await listAuditLogsSDK({ electionId });
        return { success: true, data: res.data.auditLogs };
    } catch (error) {
        console.error('listAuditLogsAction error:', error);
        return { success: false, error: '감사 로그를 불러오지 못했습니다.' };
    }
}

export async function getVoterByInfoAction(vars: { electionId: string, phone: string, birthdate: string }) {
    try {
        const res = await getVoterByInfoSDK(vars);
        return { success: true, data: res.data.voters };
    } catch (error) {
        console.error('getVoterByInfoAction error:', error);
        return { success: false, error: '선거인 정보를 조회하지 못했습니다.' };
    }
}

export async function listCandidatesByPositionAction(electionId: string, position: string) {
    try {
        const res = await listCandidatesByPositionSDK({ electionId, position });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('listCandidatesByPositionAction error:', error);
        return { success: false, error: '직분별 후보자 목록을 불러오지 못했습니다.' };
    }
}

export async function getResultsByRoundAction(electionId: string, position: string, round: number) {
    try {
        const res = await getResultsByRoundSDK({ electionId, position, round });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('getResultsByRoundAction error:', error);
        return { success: false, error: '투표 결과를 불러오지 못했습니다.' };
    }
}

// --- NEW Member & Survey Queries ---
export async function getMemberByInfoAction(vars: { phone: string, birthdate: string }) {
    try {
        const res = await getMemberByInfoSDK(vars);
        return { success: true, data: res.data.members };
    } catch (error) {
        console.error('getMemberByInfoAction error:', error);
        return { success: false, error: '교인 정보를 조회하지 못했습니다.' };
    }
}

export async function getMemberByBasicInfoAction(vars: { name: string, phone: string }) {
    try {
        const res = await getMemberByBasicInfoSDK(vars);
        return { success: true, data: res.data.members };
    } catch (error) {
        console.error('getMemberByBasicInfoAction error:', error);
        return { success: false, error: '교인 정보를 조회하지 못했습니다.' };
    }
}

export async function listMembersAction() {
    try {
        const res = await listMembersSDK();
        return { success: true, data: res.data.members };
    } catch (error) {
        console.error('listMembersAction error:', error);
        return { success: false, error: '교인 목록을 불러오지 못했습니다.' };
    }
}

export async function getSurveyAction(vars: { id: string }) {
    try {
        const res = await getSurveySDK({ id: vars.id });
        return { success: true, data: res.data.survey };
    } catch (error) {
        console.error('getSurveyAction error:', error);
        return { success: false, error: '설문 정보를 불러오지 못했습니다.' };
    }
}

export async function listSurveyQuestionsAction(surveyId: string) {
    try {
        const res = await listSurveyQuestionsSDK({ surveyId });
        return { success: true, data: res.data.surveyQuestions };
    } catch (error) {
        console.error('listSurveyQuestionsAction error:', error);
        return { success: false, error: '문항 목록을 불러오지 못했습니다.' };
    }
}


// --- Mutations ---
export async function createVoterAction(vars: any) {
    try {
        await createVoterSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createVoterAction error:', error);
        return { success: false, error: '선거인 등록에 실패했습니다.' };
    }
}

export async function updateVoterAction(vars: any) {
    try {
        await updateVoterSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('updateVoterAction error:', error);
        return { success: false, error: '선거인 정보 수정에 실패했습니다.' };
    }
}

export async function deleteVoterAction(vars: any) {
    try {
        await deleteVoterSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('deleteVoterAction error:', error);
        return { success: false, error: '선거인 삭제에 실패했습니다.' };
    }
}

export async function createCandidateAction(vars: any) {
    try {
        await createCandidateSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createCandidateAction error:', error);
        return { success: false, error: '후보자 등록에 실패했습니다.' };
    }
}

export async function updateCandidateAction(vars: any) {
    try {
        await updateCandidateSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('updateCandidateAction error:', error);
        return { success: false, error: '후보자 정보 수정에 실패했습니다.' };
    }
}

export async function deleteCandidateAction(vars: any) {
    try {
        await deleteCandidateSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('deleteCandidateAction error:', error);
        return { success: false, error: '후보자 삭제에 실패했습니다.' };
    }
}

export async function createAdminLogAction(vars: any) {
    try {
        await createAdminLogSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createAdminLogAction error:', error);
        return { success: false, error: '어드민 로그 기록에 실패했습니다.' };
    }
}

export async function createAuditLogAction(vars: any) {
    try {
        await createAuditLogSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createAuditLogAction error:', error);
        return { success: false, error: '감사 로그 기록에 실패했습니다.' };
    }
}

export async function submitVoteSQLAction(vars: { voterId: string, electionId: string, position: string, round: number }) {
    try {
        await submitVoteSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('submitVoteSQLAction error:', error);
        return { success: false, error: '투표 기록 저장에 실패했습니다.' };
    }
}

export async function deleteCandidatesByRoundAction(electionId: string, position: string, round: number) {
    try {
        await deleteCandidatesByRoundSDK({ electionId, position, round });
        return { success: true };
    } catch (error) {
        console.error('deleteCandidatesByRoundAction error:', error);
        return { success: false, error: '후보자 일괄 삭제에 실패했습니다.' };
    }
}

// --- NEW: Member / System / Survey Mutations ---

export async function createMemberAction(vars: { name: string, phone?: string, birthdate?: string, originalId?: string, isSelfRegistered?: boolean }) {
    try {
        await createMemberSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createMemberAction error:', error);
        return { success: false, error: '교인 등록에 실패했습니다.' };
    }
}

export async function updateMemberAction(vars: { id: string, name?: string, phone?: string, birthdate?: string, isSelfRegistered?: boolean }) {
    try {
        await updateMemberSDK(vars as any);
        return { success: true };
    } catch (error) {
        console.error('updateMemberAction error:', error);
        return { success: false, error: '교인 정보 수정에 실패했습니다.' };
    }
}

export async function deleteMemberAction(id: string) {
    try {
        await deleteMemberSDK({ id });
        return { success: true };
    } catch (error) {
        console.error('deleteMemberAction error:', error);
        return { success: false, error: '교인 삭제에 실패했습니다.' };
    }
}

export async function updateSystemServiceAction(vars: { systemId: string, activeService: string, activeSurveyId?: string }) {
    try {
        await updateSystemServiceSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('updateSystemServiceAction error:', error);
        return { success: false, error: '서비스 설정 업데이트에 실패했습니다.' };
    }
}

export async function createSurveyAction(vars: { title: string, description?: string }) {
    try {
        await createSurveySDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createSurveyAction error:', error);
        return { success: false, error: '설문 생성에 실패했습니다.' };
    }
}

export async function listSurveysAction() {
    try {
        const res = await listSurveysSDK();
        return { success: true, data: res.data.surveys };
    } catch (error) {
        console.error('listSurveysAction error:', error);
        return { success: false, error: '설문 목록을 불러오지 못했습니다.' };
    }
}

export async function updateSurveyAction(vars: { id: string, title?: string, description?: string, isActive?: boolean, startDate?: string, endDate?: string }) {
    try {
        // Filter out null or undefined fields to prevent potential issues with Data Connect null handling
        const cleanedVars = Object.fromEntries(
            Object.entries(vars).filter(([_, v]) => v !== undefined && v !== null)
        );
        console.log('updateSurveyAction vars:', cleanedVars);
        await updateSurveySDK(cleanedVars as any);
        revalidatePath('/admin');
        revalidatePath(`/admin/surveys/${vars.id}`);
        return { success: true };
    } catch (error: any) {
        console.error('updateSurveyAction error:', error);
        // 에러 객체의 상세 내용을 문자열화하여 전달
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

export async function deleteSurveyAction(id: string) {
    try {
        await deleteSurveySDK({ id });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('deleteSurveyAction error:', error);
        return { success: false, error: '설문을 삭제하지 못했습니다.' };
    }
}

export async function createSurveyQuestionAction(vars: { surveyId: string, sectionId?: string, text: string, type: string, options?: string, maxChoices?: number, logic?: string, orderIdx: number }) {
    try {
        const cleanedVars = Object.fromEntries(
            Object.entries(vars).filter(([_, v]) => v !== undefined && v !== null)
        );
        console.log('createSurveyQuestionAction vars:', cleanedVars);
        await createSurveyQuestionSDK(cleanedVars as any);
        revalidatePath(`/admin/surveys/${vars.surveyId}`);
        return { success: true };
    } catch (error: any) {
        console.error('createSurveyQuestionAction error:', error);
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

export async function updateSurveyQuestionAction(vars: { surveyId: string, id: string, sectionId?: string | null, text?: string, type?: string, options?: string | null, maxChoices?: number | null, logic?: string | null, orderIdx?: number }) {
    try {
        const { surveyId, ...sdkVars } = vars;
        // Keep nulls for sectionId, logic, options, maxChoices so they can be cleared/reset
        const cleanedVars = Object.fromEntries(
            Object.entries(sdkVars).filter(([_, v]) => v !== undefined)
        );
        console.log('updateSurveyQuestionAction variables to SDK:', JSON.stringify(cleanedVars, null, 2));
        
        await updateSurveyQuestionSDK(cleanedVars as any);
        revalidatePath(`/admin/surveys/${surveyId}`);
        return { success: true };
    } catch (error: any) {
        console.error('updateSurveyQuestionAction error:', error);
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

export async function deleteSurveyQuestionAction(id: string, surveyId: string) {
    try {
        await deleteSurveyQuestionSDK({ id });
        revalidatePath(`/admin/surveys/${surveyId}`);
        return { success: true };
    } catch (error: any) {
        console.error('deleteSurveyQuestionAction error:', error);
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

// --- SurveySection Actions ---
export async function listSurveySectionsAction(surveyId: string) {
    try {
        const res = await listSurveySectionsSDK({ surveyId });
        return { success: true, data: res.data.surveySections };
    } catch (error) {
        console.error('listSurveySectionsAction error:', error);
        return { success: false, error: '섹션 목록을 불러오지 못했습니다.' };
    }
}

export async function createSurveySectionAction(vars: { surveyId: string, title: string, description?: string, orderIdx: number }) {
    try {
        const cleanedVars = Object.fromEntries(
            Object.entries(vars).filter(([_, v]) => v !== undefined && v !== null)
        );
        await createSurveySectionSDK(cleanedVars as any);
        revalidatePath(`/admin/surveys/${vars.surveyId}`);
        return { success: true };
    } catch (error: any) {
        console.error('createSurveySectionAction error:', error);
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

export async function updateSurveySectionAction(vars: { surveyId: string, id: string, title?: string, description?: string, orderIdx?: number }) {
    try {
        const { surveyId, ...sdkVars } = vars;
        const cleanedVars = Object.fromEntries(
            Object.entries(sdkVars).filter(([_, v]) => v !== undefined && v !== null)
        );
        await updateSurveySectionSDK(cleanedVars as any);
        revalidatePath(`/admin/surveys/${surveyId}`);
        return { success: true };
    } catch (error: any) {
        console.error('updateSurveySectionAction error:', error);
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

export async function deleteSurveySectionAction(id: string, surveyId: string) {
    try {
        await deleteSurveySectionSDK({ id });
        revalidatePath(`/admin/surveys/${surveyId}`);
        return { success: true };
    } catch (error: any) {
        console.error('deleteSurveySectionAction error:', error);
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return { success: false, error: errorMessage };
    }
}

export async function submitSurveyResponseAction(vars: { surveyId: string, memberId: string, answers: string }) {
    try {
        let finalMemberId = vars.memberId;
        
        // 가상 ID(anonymous_...)인 경우: 고정된 '익명' 교인 UUID를 조회하여 사용
        // surveyResponse_insert는 (memberId, surveyId) 유니크 제약이 없으므로
        // 같은 memberId로 반복 제출해도 각각 독립된 레코드가 생성됨 → 안전
        if (vars.memberId.startsWith('anonymous_')) {
            // 이름='익명', 전화번호='010-0000-0000'인 고정 익명 계정 조회
            const anonRes = await getMemberByBasicInfoSDK({ name: '익명', phone: '010-0000-0000' });
            const anonMember = anonRes.data.members?.[0];
            
            if (anonMember) {
                finalMemberId = anonMember.id;
                console.log(`[Submit] Using fixed anonymous member UUID: ${finalMemberId}`);
            } else {
                // 고정 익명 계정이 없으면 1회만 생성 (이후는 항상 위에서 찾힘)
                console.log('[Submit] Fixed anonymous member not found, creating one...');
                await createMemberSDK({
                    name: '익명',
                    phone: '010-0000-0000',
                    birthdate: '000000',
                    isSelfRegistered: false
                });
                // 생성 직후 재조회
                const retryRes = await getMemberByBasicInfoSDK({ name: '익명', phone: '010-0000-0000' });
                const created = retryRes.data.members?.[0];
                if (created) {
                    finalMemberId = created.id;
                } else {
                    return { success: false, error: '익명 계정을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
                }
            }
        }
        
        await submitSurveyResponseSDK({
            ...vars,
            memberId: finalMemberId
        });
        
        revalidatePath(`/admin/surveys/${vars.surveyId}`);
        revalidatePath(`/admin/surveys/${vars.surveyId}/results`);
        
        return { success: true };
    } catch (error: any) {
        console.error('submitSurveyResponseAction error:', error);
        return { success: false, error: error.message || '설문 응답 제출에 실패했습니다.' };
    }
}

export async function getSurveyResponseByMemberAction(vars: { surveyId: string, memberId: string }) {
    try {
        const res = await getSurveyResponseByMemberSDK(vars);
        return { success: true, data: res.data.surveyResponses };
    } catch (error) {
        console.error('getSurveyResponseByMemberAction error:', error);
        return { success: false, error: '응답 조회에 실패했습니다.' };
    }
}

// 설문 응답 관리 액션

export async function listSurveyResponsesAction(surveyId: string) {
    try {
        // 런타임 프로젝트 ID 확인용 로그
        console.log(`[DEBUG] Current Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
        console.log(`[DEBUG] Calling ListSurveyResponsesOnly for survey: ${surveyId}`);

        let allData: any[] = [];
        let currentOffset = 0;
        const fetchLimit = 100;
        let hasMore = true;

        while (hasMore) {
            const res = await listSurveyResponsesNoJoinSDK({ surveyId, limit: fetchLimit, offset: currentOffset });
            const chunk = res.data.surveyResponses || [];
            allData = allData.concat(chunk);
            
            if (chunk.length < fetchLimit) {
                hasMore = false;
            } else {
                currentOffset += fetchLimit;
            }
        }
        
        console.log(`[DEBUG] Total SDK Response data received: ${allData.length}`);
        
        // DataConnect SDK 캐시 참조 완전 차단
        const data = JSON.parse(JSON.stringify(allData));
        
        // 어드민 UI와 기존 로직 호환성을 위해 가짜 member 객체 주입
        // NoJoin 쿼리이므로 memberId 필드가 없음 - 익명 표시용 더미 주입
        data.forEach((r: any) => {
            r.member = {
                id: 'anonymous_fixed_uuid',
                name: '익명',
                phone: '010-0000-0000',
                isSelfRegistered: true
            };
        });
        
        // 추가로 id 기준 중복 제거 (방어 로직)
        const unique = data.filter((r: any, i: number, arr: any[]) => 
            arr.findIndex((x: any) => x.id === r.id) === i
        );
        
        return { success: true, data: unique };
    } catch (error: any) {
        console.error('listSurveyResponsesAction error:', error);
        return { 
            success: false, 
            error: error.message || '응답 목록을 불러오지 못했습니다. (서버 에러)' 
        };
    }
}

export async function deleteSurveyResponseAction(id: string, surveyId?: string) {
    try {
        await deleteSurveyResponseSDK({ id });
        // 동적 경로 패턴으로 revalidate
        revalidatePath('/admin/surveys', 'layout');
        if (surveyId) {
            revalidatePath(`/admin/surveys/${surveyId}`);
        }
        return { success: true };
    } catch (error) {
        console.error('deleteSurveyResponseAction error:', error);
        return { success: false, error: '응답 삭제에 실패했습니다.' };
    }
}

export async function updateSurveyResponseAction(id: string, answers: string) {
    try {
        await updateSurveyResponseSDK({ id, answers });
        return { success: true };
    } catch (error) {
        console.error('updateSurveyResponseAction error:', error);
        return { success: false, error: '응답 수정에 실패했습니다.' };
    }
}
