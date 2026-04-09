'use server';

import '@/lib/firebase'; // Ensure Firebase is initialized on server-side

import { 
    getElectionSettings as getSettingsSDK,
    listCandidatesByRound as listCandidatesSDK,
    listVoters as listVotersSDK,
    listAllCandidates as listAllCandidatesSDK,
    listAuditLogs as listAuditLogsSDK,
    listVoterParticipations as listParticipationsSDK,
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
    createSurvey as createSurveySDK,
    updateSystemService as updateSystemServiceSDK,
    getMemberByInfo as getMemberByInfoSDK,
    getSurvey as getSurveySDK,
    listSurveys as listSurveysSDK,
    getVoterByInfo as getVoterByInfoSDK
} from '@/lib/dataconnect';


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

export async function getSurveyAction(vars: { id: string }) {
    try {
        const res = await getSurveySDK({ id: vars.id });
        return { success: true, data: res.data.survey };
    } catch (error) {
        console.error('getSurveyAction error:', error);
        return { success: false, error: '설문 정보를 불러오지 못했습니다.' };
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

export async function createMemberAction(vars: { name: string, phone?: string, birthdate?: string, originalId?: string }) {
    try {
        await createMemberSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createMemberAction error:', error);
        return { success: false, error: '교인 등록에 실패했습니다.' };
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
