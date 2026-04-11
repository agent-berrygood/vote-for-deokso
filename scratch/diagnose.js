
import { listSurveyQuestionsAction, listSurveyResponsesAction } from './src/app/actions/data';

async function diagnose(surveyId) {
    console.log('--- Diagnosing Survey ID:', surveyId);
    
    const qRes = await listSurveyQuestionsAction(surveyId);
    if (!qRes.success) {
        console.error('Failed to fetch questions');
        return;
    }
    const questions = qRes.data;
    console.log('Current Questions count:', questions.length);
    const qIds = questions.map(q => q.id);
    console.log('Question IDs:', qIds);

    const rRes = await listSurveyResponsesAction(surveyId);
    if (!rRes.success) {
        console.error('Failed to fetch responses');
        return;
    }
    const responses = rRes.data;
    console.log('Total Responses:', responses.length);

    responses.forEach((r, idx) => {
        try {
            const answers = JSON.parse(r.answers);
            const answerKeys = Object.keys(answers);
            console.log(`Response ${idx} keys:`, answerKeys);
            
            const matched = answerKeys.filter(k => qIds.includes(k));
            console.log(`Response ${idx} matched keys:`, matched.length, '/', answerKeys.length);
            
            if (matched.length === 0 && answerKeys.length > 0) {
                console.warn('CRITICAL: No keys matched! IDs in DB might be stale.');
            }
        } catch (e) {
            console.error(`Response ${idx} parse error:`, r.answers);
        }
    });
}

// 이 스크립트는 직접 실행용이 아니며, 로직 확인용입니다.
