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
    deleteSurveySection as deleteSurveySectionSDK
} from '@/lib/dataconnect';


// --- Queries ---
export async function getElectionSettingsAction(electionId: string) {
    try {
        noStore();
        const res = await getSettingsSDK({ electionId });
        return { success: true, data: res.data.election };
    } catch (error) {
        console.error('getElectionSettingsAction error:', error);
        return { success: false, error: '? ê±° ?¤ì •??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listCandidatesByRoundAction(electionId: string, position: string, round: number) {
    try {
        noStore();
        const res = await listCandidatesSDK({ electionId, position, round });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('listCandidatesByRoundAction error:', error);
        return { success: false, error: '?„ë³´??ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listVotersAction(electionId: string) {
    try {
        noStore();
        const res = await listVotersSDK({ electionId });
        return { success: true, data: res.data.voters };
    } catch (error) {
        console.error('listVotersAction error:', error);
        return { success: false, error: '? ê±°??ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listAllCandidatesAction(electionId: string) {
    try {
        noStore();
        const res = await listAllCandidatesSDK({ electionId });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('listAllCandidatesAction error:', error);
        return { success: false, error: 'ëª¨ë“  ?„ë³´??ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listVoterParticipationsAction(electionId: string) {
    try {
        noStore();
        const res = await listParticipationsSDK({ electionId });
        return { success: true, data: res.data.voterParticipations };
    } catch (error) {
        console.error('listVoterParticipationsAction error:', error);
        return { success: false, error: '?¬í‘œ ì°¸ì—¬ ?„í™©??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listAuditLogsAction(electionId: string) {
    try {
        noStore();
        const res = await listAuditLogsSDK({ electionId });
        return { success: true, data: res.data.auditLogs };
    } catch (error) {
        console.error('listAuditLogsAction error:', error);
        return { success: false, error: 'ê°ì‚¬ ë¡œê·¸ë¥?ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function getVoterByInfoAction(vars: { electionId: string, phone: string, birthdate: string }) {
    try {
        noStore();
        const res = await getVoterByInfoSDK(vars);
        return { success: true, data: res.data.voters };
    } catch (error) {
        console.error('getVoterByInfoAction error:', error);
        return { success: false, error: '? ê±°???•ë³´ë¥?ì¡°íšŒ?˜ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listCandidatesByPositionAction(electionId: string, position: string) {
    try {
        noStore();
        const res = await listCandidatesByPositionSDK({ electionId, position });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('listCandidatesByPositionAction error:', error);
        return { success: false, error: 'ì§ë¶„ë³??„ë³´??ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function getResultsByRoundAction(electionId: string, position: string, round: number) {
    try {
        noStore();
        const res = await getResultsByRoundSDK({ electionId, position, round });
        return { success: true, data: res.data.candidates };
    } catch (error) {
        console.error('getResultsByRoundAction error:', error);
        return { success: false, error: '?¬í‘œ ê²°ê³¼ë¥?ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

// --- NEW Member & Survey Queries ---
export async function getMemberByInfoAction(vars: { phone: string, birthdate: string }) {
    try {
        noStore();
        const res = await getMemberByInfoSDK(vars);
        return { success: true, data: res.data.members };
    } catch (error) {
        console.error('getMemberByInfoAction error:', error);
        return { success: false, error: 'êµì¸ ?•ë³´ë¥?ì¡°íšŒ?˜ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function getMemberByBasicInfoAction(vars: { name: string, phone: string }) {
    try {
        noStore();
        const res = await getMemberByBasicInfoSDK(vars);
        return { success: true, data: res.data.members };
    } catch (error) {
        console.error('getMemberByBasicInfoAction error:', error);
        return { success: false, error: 'êµì¸ ?•ë³´ë¥?ì¡°íšŒ?˜ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listMembersAction() {
    try {
        noStore();
        const res = await listMembersSDK();
        return { success: true, data: res.data.members };
    } catch (error) {
        console.error('listMembersAction error:', error);
        return { success: false, error: 'êµì¸ ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function getSurveyAction(vars: { id: string }) {
    try {
        noStore();
        const res = await getSurveySDK({ id: vars.id });
        return { success: true, data: res.data.survey };
    } catch (error) {
        console.error('getSurveyAction error:', error);
        return { success: false, error: '?¤ë¬¸ ?•ë³´ë¥?ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}

export async function listSurveyQuestionsAction(surveyId: string) {
    try {
        noStore();
        const res = await listSurveyQuestionsSDK({ surveyId });
        return { success: true, data: res.data.surveyQuestions };
    } catch (error) {
        console.error('listSurveyQuestionsAction error:', error);
        return { success: false, error: 'ë¬¸í•­ ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
    }
}


// --- Mutations ---
export async function createVoterAction(vars: any) {
    try {
        await createVoterSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createVoterAction error:', error);
        return { success: false, error: '? ê±°???±ë¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function updateVoterAction(vars: any) {
    try {
        await updateVoterSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('updateVoterAction error:', error);
        return { success: false, error: '? ê±°???•ë³´ ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function deleteVoterAction(vars: any) {
    try {
        await deleteVoterSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('deleteVoterAction error:', error);
        return { success: false, error: '? ê±°???? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function createCandidateAction(vars: any) {
    try {
        await createCandidateSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createCandidateAction error:', error);
        return { success: false, error: '?„ë³´???±ë¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function updateCandidateAction(vars: any) {
    try {
        await updateCandidateSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('updateCandidateAction error:', error);
        return { success: false, error: '?„ë³´???•ë³´ ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function deleteCandidateAction(vars: any) {
    try {
        await deleteCandidateSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('deleteCandidateAction error:', error);
        return { success: false, error: '?„ë³´???? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function createAdminLogAction(vars: any) {
    try {
        await createAdminLogSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createAdminLogAction error:', error);
        return { success: false, error: '?´ë“œë¯?ë¡œê·¸ ê¸°ë¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function createAuditLogAction(vars: any) {
    try {
        await createAuditLogSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createAuditLogAction error:', error);
        return { success: false, error: 'ê°ì‚¬ ë¡œê·¸ ê¸°ë¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function submitVoteSQLAction(vars: { voterId: string, electionId: string, position: string, round: number }) {
    try {
        await submitVoteSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('submitVoteSQLAction error:', error);
        return { success: false, error: '?¬í‘œ ê¸°ë¡ ?€?¥ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function deleteCandidatesByRoundAction(electionId: string, position: string, round: number) {
    try {
        await deleteCandidatesByRoundSDK({ electionId, position, round });
        return { success: true };
    } catch (error) {
        console.error('deleteCandidatesByRoundAction error:', error);
        return { success: false, error: '?„ë³´???¼ê´„ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

// --- NEW: Member / System / Survey Mutations ---

export async function createMemberAction(vars: { name: string, phone?: string, birthdate?: string, originalId?: string, isSelfRegistered?: boolean }) {
    try {
        await createMemberSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createMemberAction error:', error);
        return { success: false, error: 'êµì¸ ?±ë¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function updateMemberAction(vars: { id: string, name?: string, phone?: string, birthdate?: string, isSelfRegistered?: boolean }) {
    try {
        await updateMemberSDK(vars as any);
        return { success: true };
    } catch (error) {
        console.error('updateMemberAction error:', error);
        return { success: false, error: 'êµì¸ ?•ë³´ ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function deleteMemberAction(id: string) {
    try {
        await deleteMemberSDK({ id });
        return { success: true };
    } catch (error) {
        console.error('deleteMemberAction error:', error);
        return { success: false, error: 'êµì¸ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function updateSystemServiceAction(vars: { systemId: string, activeService: string, activeSurveyId?: string }) {
    try {
        await updateSystemServiceSDK(vars);
        return { success: true };
    } catch (error) {
        console.error('updateSystemServiceAction error:', error);
        return { success: false, error: '?œë¹„???¤ì • ?…ë°?´íŠ¸???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function createSurveyAction(vars: { title: string, description?: string }) {
    try {
        await createSurveySDK(vars);
        return { success: true };
    } catch (error) {
        console.error('createSurveyAction error:', error);
        return { success: false, error: '?¤ë¬¸ ?ì„±???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function listSurveysAction() {
    try {
        noStore();
        const res = await listSurveysSDK();
        return { success: true, data: res.data.surveys };
    } catch (error) {
        console.error('listSurveysAction error:', error);
        return { success: false, error: '?¤ë¬¸ ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
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
        // ?ëŸ¬ ê°ì²´???ì„¸ ?´ìš©??ë¬¸ì?´í™”?˜ì—¬ ?„ë‹¬
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
        return { success: false, error: '?¤ë¬¸???? œ?˜ì? ëª»í–ˆ?µë‹ˆ??' };
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
        noStore();
        const res = await listSurveySectionsSDK({ surveyId });
        return { success: true, data: res.data.surveySections };
    } catch (error) {
        console.error('listSurveySectionsAction error:', error);
        return { success: false, error: '?¹ì…˜ ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??' };
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
        noStore();
        let finalMemberId = vars.memberId;
        
        // ê°€??ID(anonymous_...)??ê²½ìš°: ê³ ì •??'?µëª…' êµì¸ UUIDë¥?ì¡°íšŒ?˜ì—¬ ?¬ìš©
        // surveyResponse_insert??(memberId, surveyId) ? ë‹ˆ???œì•½???†ìœ¼ë¯€ë¡?
        // ê°™ì? memberIdë¡?ë°˜ë³µ ?œì¶œ?´ë„ ê°ê° ?…ë¦½???ˆì½”?œê? ?ì„±?????ˆì „
        if (vars.memberId.startsWith('anonymous_')) {
            // ?´ë¦„='?µëª…', ?„í™”ë²ˆí˜¸='010-0000-0000'??ê³ ì • ?µëª… ê³„ì • ì¡°íšŒ
            const anonRes = await getMemberByBasicInfoSDK({ name: '?µëª…', phone: '010-0000-0000' });
            const anonMember = anonRes.data.members?.[0];
            
            if (anonMember) {
                finalMemberId = anonMember.id;
                console.log(`[Submit] Using fixed anonymous member UUID: ${finalMemberId}`);
            } else {
                // ê³ ì • ?µëª… ê³„ì •???†ìœ¼ë©?1?Œë§Œ ?ì„± (?´í›„????ƒ ?„ì—??ì°¾í˜)
                console.log('[Submit] Fixed anonymous member not found, creating one...');
                await createMemberSDK({
                    name: '?µëª…',
                    phone: '010-0000-0000',
                    birthdate: '000000',
                    isSelfRegistered: false
                });
                // ?ì„± ì§í›„ ?¬ì¡°??
                const retryRes = await getMemberByBasicInfoSDK({ name: '?µëª…', phone: '010-0000-0000' });
                const created = retryRes.data.members?.[0];
                if (created) {
                    finalMemberId = created.id;
                } else {
                    return { success: false, error: '?µëª… ê³„ì •???ì„±?˜ì? ëª»í–ˆ?µë‹ˆ?? ? ì‹œ ???¤ì‹œ ?œë„??ì£¼ì„¸??' };
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
        return { success: false, error: error.message || '?¤ë¬¸ ?‘ë‹µ ?œì¶œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function getSurveyResponseByMemberAction(vars: { surveyId: string, memberId: string }) {
    try {
        noStore();
        const res = await getSurveyResponseByMemberSDK(vars);
        return { success: true, data: res.data.surveyResponses };
    } catch (error) {
        console.error('getSurveyResponseByMemberAction error:', error);
        return { success: false, error: '?‘ë‹µ ì¡°íšŒ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

// ?¤ë¬¸ ?‘ë‹µ ê´€ë¦??¡ì…˜

export async function listSurveyResponsesAction(surveyId: string) {
    try {
        noStore();
        // ?°í????„ë¡œ?íŠ¸ ID ?•ì¸??ë¡œê·¸
        console.log(`[DEBUG] Current Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
        console.log(`[DEBUG] Calling ListSurveyResponsesOnly for survey: ${surveyId}`);

        // member ì¡°ì¸???œì™¸??ì¿¼ë¦¬ ?¸ì¶œ (SDK ?´ë? ?•ê·œ??ìºì‹œ ?¤ì—¼ ?ì²œ ì°¨ë‹¨)
        const res = await listSurveyResponsesNoJoinSDK({ surveyId });
        console.log(`[DEBUG] SDK Response data received for survey: ${surveyId}`);
        const raw = res.data.surveyResponses || [];
        
        // DataConnect SDK ìºì‹œ ì°¸ì¡° ?„ì „ ì°¨ë‹¨
        const data = JSON.parse(JSON.stringify(raw));
        
        // ?´ë“œë¯?UI?€ ê¸°ì¡´ ë¡œì§ ?¸í™˜?±ì„ ?„í•´ ê°€ì§?member ê°ì²´ ì£¼ì…
        // NoJoin ì¿¼ë¦¬?´ë?ë¡?memberId ?„ë“œê°€ ?†ìŒ - ?µëª… ?œì‹œ???”ë? ì£¼ì…
        data.forEach((r: any) => {
            r.member = {
                id: 'anonymous_fixed_uuid',
                name: '?µëª…',
                phone: '010-0000-0000',
                isSelfRegistered: true
            };
        });
        
        // ì¶”ê?ë¡?id ê¸°ì? ì¤‘ë³µ ?œê±° (ë°©ì–´ ë¡œì§)
        const unique = data.filter((r: any, i: number, arr: any[]) => 
            arr.findIndex((x: any) => x.id === r.id) === i
        );
        
        return { success: true, data: unique };
    } catch (error: any) {
        console.error('listSurveyResponsesAction error:', error);
        return { 
            success: false, 
            error: error.message || '?‘ë‹µ ëª©ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ?? (?œë²„ ?ëŸ¬)' 
        };
    }
}

export async function deleteSurveyResponseAction(id: string, surveyId?: string) {
    try {
        await deleteSurveyResponseSDK({ id });
        // ?™ì  ê²½ë¡œ ?¨í„´?¼ë¡œ revalidate
        revalidatePath('/admin/surveys', 'layout');
        if (surveyId) {
            revalidatePath(`/admin/surveys/${surveyId}`);
        }
        return { success: true };
    } catch (error) {
        console.error('deleteSurveyResponseAction error:', error);
        return { success: false, error: '?‘ë‹µ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}

export async function updateSurveyResponseAction(id: string, answers: string) {
    try {
        await updateSurveyResponseSDK({ id, answers });
        return { success: true };
    } catch (error) {
        console.error('updateSurveyResponseAction error:', error);
        return { success: false, error: '?‘ë‹µ ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤.' };
    }
}
