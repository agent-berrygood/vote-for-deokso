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

export const createMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMember', inputVars);
}
createMemberRef.operationName = 'CreateMember';

export function createMember(dcOrVars, vars) {
  return executeMutation(createMemberRef(dcOrVars, vars));
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

export const submitSurveyResponseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitSurveyResponse', inputVars);
}
submitSurveyResponseRef.operationName = 'SubmitSurveyResponse';

export function submitSurveyResponse(dcOrVars, vars) {
  return executeMutation(submitSurveyResponseRef(dcOrVars, vars));
}

