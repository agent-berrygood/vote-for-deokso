import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'vote',
  service: 'vote-deokso-sql',
  location: 'asia-northeast3'
};

export const getSystemSettingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSystemSetting', inputVars);
}
getSystemSettingRef.operationName = 'GetSystemSetting';

export function getSystemSetting(dcOrVars, vars) {
  return executeQuery(getSystemSettingRef(dcOrVars, vars));
}

export const listSurveysRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveys');
}
listSurveysRef.operationName = 'ListSurveys';

export function listSurveys(dc) {
  return executeQuery(listSurveysRef(dc));
}

export const getVoterByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVoterByInfo', inputVars);
}
getVoterByInfoRef.operationName = 'GetVoterByInfo';

export function getVoterByInfo(dcOrVars, vars) {
  return executeQuery(getVoterByInfoRef(dcOrVars, vars));
}

export const getElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetElectionSettings', inputVars);
}
getElectionSettingsRef.operationName = 'GetElectionSettings';

export function getElectionSettings(dcOrVars, vars) {
  return executeQuery(getElectionSettingsRef(dcOrVars, vars));
}

export const listCandidatesByPositionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByPosition', inputVars);
}
listCandidatesByPositionRef.operationName = 'ListCandidatesByPosition';

export function listCandidatesByPosition(dcOrVars, vars) {
  return executeQuery(listCandidatesByPositionRef(dcOrVars, vars));
}

export const listCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByRound', inputVars);
}
listCandidatesByRoundRef.operationName = 'ListCandidatesByRound';

export function listCandidatesByRound(dcOrVars, vars) {
  return executeQuery(listCandidatesByRoundRef(dcOrVars, vars));
}

export const submitVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitVote', inputVars);
}
submitVoteRef.operationName = 'SubmitVote';

export function submitVote(dcOrVars, vars) {
  return executeMutation(submitVoteRef(dcOrVars, vars));
}

export const updateCandidateVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidateVote', inputVars);
}
updateCandidateVoteRef.operationName = 'UpdateCandidateVote';

export function updateCandidateVote(dcOrVars, vars) {
  return executeMutation(updateCandidateVoteRef(dcOrVars, vars));
}

export const listVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoters', inputVars);
}
listVotersRef.operationName = 'ListVoters';

export function listVoters(dcOrVars, vars) {
  return executeQuery(listVotersRef(dcOrVars, vars));
}

export const createVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVoter', inputVars);
}
createVoterRef.operationName = 'CreateVoter';

export function createVoter(dcOrVars, vars) {
  return executeMutation(createVoterRef(dcOrVars, vars));
}

export const updateVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVoter', inputVars);
}
updateVoterRef.operationName = 'UpdateVoter';

export function updateVoter(dcOrVars, vars) {
  return executeMutation(updateVoterRef(dcOrVars, vars));
}

export const deleteVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteVoter', inputVars);
}
deleteVoterRef.operationName = 'DeleteVoter';

export function deleteVoter(dcOrVars, vars) {
  return executeMutation(deleteVoterRef(dcOrVars, vars));
}

export const listVoterParticipationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoterParticipations', inputVars);
}
listVoterParticipationsRef.operationName = 'ListVoterParticipations';

export function listVoterParticipations(dcOrVars, vars) {
  return executeQuery(listVoterParticipationsRef(dcOrVars, vars));
}

export const createCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCandidate', inputVars);
}
createCandidateRef.operationName = 'CreateCandidate';

export function createCandidate(dcOrVars, vars) {
  return executeMutation(createCandidateRef(dcOrVars, vars));
}

export const updateCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidate', inputVars);
}
updateCandidateRef.operationName = 'UpdateCandidate';

export function updateCandidate(dcOrVars, vars) {
  return executeMutation(updateCandidateRef(dcOrVars, vars));
}

export const deleteCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidate', inputVars);
}
deleteCandidateRef.operationName = 'DeleteCandidate';

export function deleteCandidate(dcOrVars, vars) {
  return executeMutation(deleteCandidateRef(dcOrVars, vars));
}

export const deleteCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidatesByRound', inputVars);
}
deleteCandidatesByRoundRef.operationName = 'DeleteCandidatesByRound';

export function deleteCandidatesByRound(dcOrVars, vars) {
  return executeMutation(deleteCandidatesByRoundRef(dcOrVars, vars));
}

export const updateElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateElectionSettings', inputVars);
}
updateElectionSettingsRef.operationName = 'UpdateElectionSettings';

export function updateElectionSettings(dcOrVars, vars) {
  return executeMutation(updateElectionSettingsRef(dcOrVars, vars));
}

export const createAdminLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAdminLog', inputVars);
}
createAdminLogRef.operationName = 'CreateAdminLog';

export function createAdminLog(dcOrVars, vars) {
  return executeMutation(createAdminLogRef(dcOrVars, vars));
}

export const createAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuditLog', inputVars);
}
createAuditLogRef.operationName = 'CreateAuditLog';

export function createAuditLog(dcOrVars, vars) {
  return executeMutation(createAuditLogRef(dcOrVars, vars));
}

export const createElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateElection', inputVars);
}
createElectionRef.operationName = 'CreateElection';

export function createElection(dcOrVars, vars) {
  return executeMutation(createElectionRef(dcOrVars, vars));
}

export const listElectionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListElections');
}
listElectionsRef.operationName = 'ListElections';

export function listElections(dc) {
  return executeQuery(listElectionsRef(dc));
}

export const updateActiveElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateActiveElection', inputVars);
}
updateActiveElectionRef.operationName = 'UpdateActiveElection';

export function updateActiveElection(dcOrVars, vars) {
  return executeMutation(updateActiveElectionRef(dcOrVars, vars));
}

export const getResultsByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetResultsByRound', inputVars);
}
getResultsByRoundRef.operationName = 'GetResultsByRound';

export function getResultsByRound(dcOrVars, vars) {
  return executeQuery(getResultsByRoundRef(dcOrVars, vars));
}

export const listAdminLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAdminLogs', inputVars);
}
listAdminLogsRef.operationName = 'ListAdminLogs';

export function listAdminLogs(dcOrVars, vars) {
  return executeQuery(listAdminLogsRef(dcOrVars, vars));
}

export const listAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAuditLogs', inputVars);
}
listAuditLogsRef.operationName = 'ListAuditLogs';

export function listAuditLogs(dcOrVars, vars) {
  return executeQuery(listAuditLogsRef(dcOrVars, vars));
}

export const deleteAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllCandidates', inputVars);
}
deleteAllCandidatesRef.operationName = 'DeleteAllCandidates';

export function deleteAllCandidates(dcOrVars, vars) {
  return executeMutation(deleteAllCandidatesRef(dcOrVars, vars));
}

export const deleteAllVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllVoters', inputVars);
}
deleteAllVotersRef.operationName = 'DeleteAllVoters';

export function deleteAllVoters(dcOrVars, vars) {
  return executeMutation(deleteAllVotersRef(dcOrVars, vars));
}

export const listAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCandidates', inputVars);
}
listAllCandidatesRef.operationName = 'ListAllCandidates';

export function listAllCandidates(dcOrVars, vars) {
  return executeQuery(listAllCandidatesRef(dcOrVars, vars));
}

export const getMemberByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMemberByInfo', inputVars);
}
getMemberByInfoRef.operationName = 'GetMemberByInfo';

export function getMemberByInfo(dcOrVars, vars) {
  return executeQuery(getMemberByInfoRef(dcOrVars, vars));
}

export const getMemberByBasicInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMemberByBasicInfo', inputVars);
}
getMemberByBasicInfoRef.operationName = 'GetMemberByBasicInfo';

export function getMemberByBasicInfo(dcOrVars, vars) {
  return executeQuery(getMemberByBasicInfoRef(dcOrVars, vars));
}

export const listMembersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMembers');
}
listMembersRef.operationName = 'ListMembers';

export function listMembers(dc) {
  return executeQuery(listMembersRef(dc));
}

export const createMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMember', inputVars);
}
createMemberRef.operationName = 'CreateMember';

export function createMember(dcOrVars, vars) {
  return executeMutation(createMemberRef(dcOrVars, vars));
}

export const updateMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMember', inputVars);
}
updateMemberRef.operationName = 'UpdateMember';

export function updateMember(dcOrVars, vars) {
  return executeMutation(updateMemberRef(dcOrVars, vars));
}

export const deleteMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMember', inputVars);
}
deleteMemberRef.operationName = 'DeleteMember';

export function deleteMember(dcOrVars, vars) {
  return executeMutation(deleteMemberRef(dcOrVars, vars));
}

export const updateSystemServiceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSystemService', inputVars);
}
updateSystemServiceRef.operationName = 'UpdateSystemService';

export function updateSystemService(dcOrVars, vars) {
  return executeMutation(updateSystemServiceRef(dcOrVars, vars));
}

export const createSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurvey', inputVars);
}
createSurveyRef.operationName = 'CreateSurvey';

export function createSurvey(dcOrVars, vars) {
  return executeMutation(createSurveyRef(dcOrVars, vars));
}

export const getSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSurvey', inputVars);
}
getSurveyRef.operationName = 'GetSurvey';

export function getSurvey(dcOrVars, vars) {
  return executeQuery(getSurveyRef(dcOrVars, vars));
}

export const updateSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSurvey', inputVars);
}
updateSurveyRef.operationName = 'UpdateSurvey';

export function updateSurvey(dcOrVars, vars) {
  return executeMutation(updateSurveyRef(dcOrVars, vars));
}

export const submitSurveyResponseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitSurveyResponse', inputVars);
}
submitSurveyResponseRef.operationName = 'SubmitSurveyResponse';

export function submitSurveyResponse(dcOrVars, vars) {
  return executeMutation(submitSurveyResponseRef(dcOrVars, vars));
}

export const getSurveyResponseByMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSurveyResponseByMember', inputVars);
}
getSurveyResponseByMemberRef.operationName = 'GetSurveyResponseByMember';

export function getSurveyResponseByMember(dcOrVars, vars) {
  return executeQuery(getSurveyResponseByMemberRef(dcOrVars, vars));
}

export const listSurveyResponsesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveyResponses', inputVars);
}
listSurveyResponsesRef.operationName = 'ListSurveyResponses';

export function listSurveyResponses(dcOrVars, vars) {
  return executeQuery(listSurveyResponsesRef(dcOrVars, vars));
}

export const getSurveyResponseByNamePhoneRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSurveyResponseByNamePhone', inputVars);
}
getSurveyResponseByNamePhoneRef.operationName = 'GetSurveyResponseByNamePhone';

export function getSurveyResponseByNamePhone(dcOrVars, vars) {
  return executeQuery(getSurveyResponseByNamePhoneRef(dcOrVars, vars));
}

export const deleteSurveyResponseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurveyResponse', inputVars);
}
deleteSurveyResponseRef.operationName = 'DeleteSurveyResponse';

export function deleteSurveyResponse(dcOrVars, vars) {
  return executeMutation(deleteSurveyResponseRef(dcOrVars, vars));
}

export const deleteSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurvey', inputVars);
}
deleteSurveyRef.operationName = 'DeleteSurvey';

export function deleteSurvey(dcOrVars, vars) {
  return executeMutation(deleteSurveyRef(dcOrVars, vars));
}

export const listSurveySectionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveySections', inputVars);
}
listSurveySectionsRef.operationName = 'ListSurveySections';

export function listSurveySections(dcOrVars, vars) {
  return executeQuery(listSurveySectionsRef(dcOrVars, vars));
}

export const createSurveySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurveySection', inputVars);
}
createSurveySectionRef.operationName = 'CreateSurveySection';

export function createSurveySection(dcOrVars, vars) {
  return executeMutation(createSurveySectionRef(dcOrVars, vars));
}

export const updateSurveySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSurveySection', inputVars);
}
updateSurveySectionRef.operationName = 'UpdateSurveySection';

export function updateSurveySection(dcOrVars, vars) {
  return executeMutation(updateSurveySectionRef(dcOrVars, vars));
}

export const deleteSurveySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurveySection', inputVars);
}
deleteSurveySectionRef.operationName = 'DeleteSurveySection';

export function deleteSurveySection(dcOrVars, vars) {
  return executeMutation(deleteSurveySectionRef(dcOrVars, vars));
}

export const listSurveyQuestionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveyQuestions', inputVars);
}
listSurveyQuestionsRef.operationName = 'ListSurveyQuestions';

export function listSurveyQuestions(dcOrVars, vars) {
  return executeQuery(listSurveyQuestionsRef(dcOrVars, vars));
}

export const createSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurveyQuestion', inputVars);
}
createSurveyQuestionRef.operationName = 'CreateSurveyQuestion';

export function createSurveyQuestion(dcOrVars, vars) {
  return executeMutation(createSurveyQuestionRef(dcOrVars, vars));
}

export const updateSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSurveyQuestion', inputVars);
}
updateSurveyQuestionRef.operationName = 'UpdateSurveyQuestion';

export function updateSurveyQuestion(dcOrVars, vars) {
  return executeMutation(updateSurveyQuestionRef(dcOrVars, vars));
}

export const deleteSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurveyQuestion', inputVars);
}
deleteSurveyQuestionRef.operationName = 'DeleteSurveyQuestion';

export function deleteSurveyQuestion(dcOrVars, vars) {
  return executeMutation(deleteSurveyQuestionRef(dcOrVars, vars));
}

