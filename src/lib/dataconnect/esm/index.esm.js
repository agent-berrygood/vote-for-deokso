import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

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

export function getSystemSetting(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSystemSettingRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listSurveysRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveys');
}
listSurveysRef.operationName = 'ListSurveys';

export function listSurveys(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listSurveysRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getVoterByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVoterByInfo', inputVars);
}
getVoterByInfoRef.operationName = 'GetVoterByInfo';

export function getVoterByInfo(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getVoterByInfoRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetElectionSettings', inputVars);
}
getElectionSettingsRef.operationName = 'GetElectionSettings';

export function getElectionSettings(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getElectionSettingsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listCandidatesByPositionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByPosition', inputVars);
}
listCandidatesByPositionRef.operationName = 'ListCandidatesByPosition';

export function listCandidatesByPosition(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listCandidatesByPositionRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByRound', inputVars);
}
listCandidatesByRoundRef.operationName = 'ListCandidatesByRound';

export function listCandidatesByRound(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listCandidatesByRoundRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const submitVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitVote', inputVars);
}
submitVoteRef.operationName = 'SubmitVote';

export function submitVote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(submitVoteRef(dcInstance, inputVars));
}

export const updateCandidateVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidateVote', inputVars);
}
updateCandidateVoteRef.operationName = 'UpdateCandidateVote';

export function updateCandidateVote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCandidateVoteRef(dcInstance, inputVars));
}

export const listVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoters', inputVars);
}
listVotersRef.operationName = 'ListVoters';

export function listVoters(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listVotersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const createVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVoter', inputVars);
}
createVoterRef.operationName = 'CreateVoter';

export function createVoter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createVoterRef(dcInstance, inputVars));
}

export const updateVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVoter', inputVars);
}
updateVoterRef.operationName = 'UpdateVoter';

export function updateVoter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateVoterRef(dcInstance, inputVars));
}

export const deleteVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteVoter', inputVars);
}
deleteVoterRef.operationName = 'DeleteVoter';

export function deleteVoter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteVoterRef(dcInstance, inputVars));
}

export const listVoterParticipationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoterParticipations', inputVars);
}
listVoterParticipationsRef.operationName = 'ListVoterParticipations';

export function listVoterParticipations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listVoterParticipationsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const createCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCandidate', inputVars);
}
createCandidateRef.operationName = 'CreateCandidate';

export function createCandidate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCandidateRef(dcInstance, inputVars));
}

export const updateCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidate', inputVars);
}
updateCandidateRef.operationName = 'UpdateCandidate';

export function updateCandidate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCandidateRef(dcInstance, inputVars));
}

export const deleteCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidate', inputVars);
}
deleteCandidateRef.operationName = 'DeleteCandidate';

export function deleteCandidate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCandidateRef(dcInstance, inputVars));
}

export const deleteCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidatesByRound', inputVars);
}
deleteCandidatesByRoundRef.operationName = 'DeleteCandidatesByRound';

export function deleteCandidatesByRound(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCandidatesByRoundRef(dcInstance, inputVars));
}

export const updateElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateElectionSettings', inputVars);
}
updateElectionSettingsRef.operationName = 'UpdateElectionSettings';

export function updateElectionSettings(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateElectionSettingsRef(dcInstance, inputVars));
}

export const createAdminLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAdminLog', inputVars);
}
createAdminLogRef.operationName = 'CreateAdminLog';

export function createAdminLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAdminLogRef(dcInstance, inputVars));
}

export const createAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuditLog', inputVars);
}
createAuditLogRef.operationName = 'CreateAuditLog';

export function createAuditLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAuditLogRef(dcInstance, inputVars));
}

export const createElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateElection', inputVars);
}
createElectionRef.operationName = 'CreateElection';

export function createElection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createElectionRef(dcInstance, inputVars));
}

export const listElectionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListElections');
}
listElectionsRef.operationName = 'ListElections';

export function listElections(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listElectionsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const updateActiveElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateActiveElection', inputVars);
}
updateActiveElectionRef.operationName = 'UpdateActiveElection';

export function updateActiveElection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateActiveElectionRef(dcInstance, inputVars));
}

export const getResultsByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetResultsByRound', inputVars);
}
getResultsByRoundRef.operationName = 'GetResultsByRound';

export function getResultsByRound(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getResultsByRoundRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listAdminLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAdminLogs', inputVars);
}
listAdminLogsRef.operationName = 'ListAdminLogs';

export function listAdminLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAdminLogsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAuditLogs', inputVars);
}
listAuditLogsRef.operationName = 'ListAuditLogs';

export function listAuditLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAuditLogsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const deleteAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllCandidates', inputVars);
}
deleteAllCandidatesRef.operationName = 'DeleteAllCandidates';

export function deleteAllCandidates(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAllCandidatesRef(dcInstance, inputVars));
}

export const deleteAllVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllVoters', inputVars);
}
deleteAllVotersRef.operationName = 'DeleteAllVoters';

export function deleteAllVoters(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAllVotersRef(dcInstance, inputVars));
}

export const listAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCandidates', inputVars);
}
listAllCandidatesRef.operationName = 'ListAllCandidates';

export function listAllCandidates(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAllCandidatesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getMemberByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMemberByInfo', inputVars);
}
getMemberByInfoRef.operationName = 'GetMemberByInfo';

export function getMemberByInfo(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getMemberByInfoRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const createMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMember', inputVars);
}
createMemberRef.operationName = 'CreateMember';

export function createMember(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMemberRef(dcInstance, inputVars));
}

export const updateSystemServiceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSystemService', inputVars);
}
updateSystemServiceRef.operationName = 'UpdateSystemService';

export function updateSystemService(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSystemServiceRef(dcInstance, inputVars));
}

export const createSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurvey', inputVars);
}
createSurveyRef.operationName = 'CreateSurvey';

export function createSurvey(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSurveyRef(dcInstance, inputVars));
}

export const getSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSurvey', inputVars);
}
getSurveyRef.operationName = 'GetSurvey';

export function getSurvey(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSurveyRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const submitSurveyResponseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitSurveyResponse', inputVars);
}
submitSurveyResponseRef.operationName = 'SubmitSurveyResponse';

export function submitSurveyResponse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(submitSurveyResponseRef(dcInstance, inputVars));
}

export const deleteSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurvey', inputVars);
}
deleteSurveyRef.operationName = 'DeleteSurvey';

export function deleteSurvey(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSurveyRef(dcInstance, inputVars));
}

export const listSurveyQuestionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveyQuestions', inputVars);
}
listSurveyQuestionsRef.operationName = 'ListSurveyQuestions';

export function listSurveyQuestions(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listSurveyQuestionsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const createSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurveyQuestion', inputVars);
}
createSurveyQuestionRef.operationName = 'CreateSurveyQuestion';

export function createSurveyQuestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSurveyQuestionRef(dcInstance, inputVars));
}

export const updateSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSurveyQuestion', inputVars);
}
updateSurveyQuestionRef.operationName = 'UpdateSurveyQuestion';

export function updateSurveyQuestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSurveyQuestionRef(dcInstance, inputVars));
}

export const deleteSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurveyQuestion', inputVars);
}
deleteSurveyQuestionRef.operationName = 'DeleteSurveyQuestion';

export function deleteSurveyQuestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSurveyQuestionRef(dcInstance, inputVars));
}

