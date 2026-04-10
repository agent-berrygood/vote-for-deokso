const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'vote',
  service: 'vote-deokso-sql',
  location: 'asia-northeast3'
};
exports.connectorConfig = connectorConfig;

const getSystemSettingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSystemSetting', inputVars);
}
getSystemSettingRef.operationName = 'GetSystemSetting';
exports.getSystemSettingRef = getSystemSettingRef;

exports.getSystemSetting = function getSystemSetting(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSystemSettingRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listSurveysRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveys');
}
listSurveysRef.operationName = 'ListSurveys';
exports.listSurveysRef = listSurveysRef;

exports.listSurveys = function listSurveys(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listSurveysRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getVoterByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVoterByInfo', inputVars);
}
getVoterByInfoRef.operationName = 'GetVoterByInfo';
exports.getVoterByInfoRef = getVoterByInfoRef;

exports.getVoterByInfo = function getVoterByInfo(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getVoterByInfoRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetElectionSettings', inputVars);
}
getElectionSettingsRef.operationName = 'GetElectionSettings';
exports.getElectionSettingsRef = getElectionSettingsRef;

exports.getElectionSettings = function getElectionSettings(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getElectionSettingsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listCandidatesByPositionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByPosition', inputVars);
}
listCandidatesByPositionRef.operationName = 'ListCandidatesByPosition';
exports.listCandidatesByPositionRef = listCandidatesByPositionRef;

exports.listCandidatesByPosition = function listCandidatesByPosition(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listCandidatesByPositionRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByRound', inputVars);
}
listCandidatesByRoundRef.operationName = 'ListCandidatesByRound';
exports.listCandidatesByRoundRef = listCandidatesByRoundRef;

exports.listCandidatesByRound = function listCandidatesByRound(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listCandidatesByRoundRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const submitVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitVote', inputVars);
}
submitVoteRef.operationName = 'SubmitVote';
exports.submitVoteRef = submitVoteRef;

exports.submitVote = function submitVote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(submitVoteRef(dcInstance, inputVars));
}
;

const updateCandidateVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidateVote', inputVars);
}
updateCandidateVoteRef.operationName = 'UpdateCandidateVote';
exports.updateCandidateVoteRef = updateCandidateVoteRef;

exports.updateCandidateVote = function updateCandidateVote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCandidateVoteRef(dcInstance, inputVars));
}
;

const listVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoters', inputVars);
}
listVotersRef.operationName = 'ListVoters';
exports.listVotersRef = listVotersRef;

exports.listVoters = function listVoters(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listVotersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVoter', inputVars);
}
createVoterRef.operationName = 'CreateVoter';
exports.createVoterRef = createVoterRef;

exports.createVoter = function createVoter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createVoterRef(dcInstance, inputVars));
}
;

const updateVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVoter', inputVars);
}
updateVoterRef.operationName = 'UpdateVoter';
exports.updateVoterRef = updateVoterRef;

exports.updateVoter = function updateVoter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateVoterRef(dcInstance, inputVars));
}
;

const deleteVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteVoter', inputVars);
}
deleteVoterRef.operationName = 'DeleteVoter';
exports.deleteVoterRef = deleteVoterRef;

exports.deleteVoter = function deleteVoter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteVoterRef(dcInstance, inputVars));
}
;

const listVoterParticipationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoterParticipations', inputVars);
}
listVoterParticipationsRef.operationName = 'ListVoterParticipations';
exports.listVoterParticipationsRef = listVoterParticipationsRef;

exports.listVoterParticipations = function listVoterParticipations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listVoterParticipationsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCandidate', inputVars);
}
createCandidateRef.operationName = 'CreateCandidate';
exports.createCandidateRef = createCandidateRef;

exports.createCandidate = function createCandidate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCandidateRef(dcInstance, inputVars));
}
;

const updateCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidate', inputVars);
}
updateCandidateRef.operationName = 'UpdateCandidate';
exports.updateCandidateRef = updateCandidateRef;

exports.updateCandidate = function updateCandidate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCandidateRef(dcInstance, inputVars));
}
;

const deleteCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidate', inputVars);
}
deleteCandidateRef.operationName = 'DeleteCandidate';
exports.deleteCandidateRef = deleteCandidateRef;

exports.deleteCandidate = function deleteCandidate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCandidateRef(dcInstance, inputVars));
}
;

const deleteCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidatesByRound', inputVars);
}
deleteCandidatesByRoundRef.operationName = 'DeleteCandidatesByRound';
exports.deleteCandidatesByRoundRef = deleteCandidatesByRoundRef;

exports.deleteCandidatesByRound = function deleteCandidatesByRound(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCandidatesByRoundRef(dcInstance, inputVars));
}
;

const updateElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateElectionSettings', inputVars);
}
updateElectionSettingsRef.operationName = 'UpdateElectionSettings';
exports.updateElectionSettingsRef = updateElectionSettingsRef;

exports.updateElectionSettings = function updateElectionSettings(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateElectionSettingsRef(dcInstance, inputVars));
}
;

const createAdminLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAdminLog', inputVars);
}
createAdminLogRef.operationName = 'CreateAdminLog';
exports.createAdminLogRef = createAdminLogRef;

exports.createAdminLog = function createAdminLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAdminLogRef(dcInstance, inputVars));
}
;

const createAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuditLog', inputVars);
}
createAuditLogRef.operationName = 'CreateAuditLog';
exports.createAuditLogRef = createAuditLogRef;

exports.createAuditLog = function createAuditLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAuditLogRef(dcInstance, inputVars));
}
;

const createElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateElection', inputVars);
}
createElectionRef.operationName = 'CreateElection';
exports.createElectionRef = createElectionRef;

exports.createElection = function createElection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createElectionRef(dcInstance, inputVars));
}
;

const listElectionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListElections');
}
listElectionsRef.operationName = 'ListElections';
exports.listElectionsRef = listElectionsRef;

exports.listElections = function listElections(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listElectionsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const updateActiveElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateActiveElection', inputVars);
}
updateActiveElectionRef.operationName = 'UpdateActiveElection';
exports.updateActiveElectionRef = updateActiveElectionRef;

exports.updateActiveElection = function updateActiveElection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateActiveElectionRef(dcInstance, inputVars));
}
;

const getResultsByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetResultsByRound', inputVars);
}
getResultsByRoundRef.operationName = 'GetResultsByRound';
exports.getResultsByRoundRef = getResultsByRoundRef;

exports.getResultsByRound = function getResultsByRound(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getResultsByRoundRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listAdminLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAdminLogs', inputVars);
}
listAdminLogsRef.operationName = 'ListAdminLogs';
exports.listAdminLogsRef = listAdminLogsRef;

exports.listAdminLogs = function listAdminLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAdminLogsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAuditLogs', inputVars);
}
listAuditLogsRef.operationName = 'ListAuditLogs';
exports.listAuditLogsRef = listAuditLogsRef;

exports.listAuditLogs = function listAuditLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAuditLogsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const deleteAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllCandidates', inputVars);
}
deleteAllCandidatesRef.operationName = 'DeleteAllCandidates';
exports.deleteAllCandidatesRef = deleteAllCandidatesRef;

exports.deleteAllCandidates = function deleteAllCandidates(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAllCandidatesRef(dcInstance, inputVars));
}
;

const deleteAllVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllVoters', inputVars);
}
deleteAllVotersRef.operationName = 'DeleteAllVoters';
exports.deleteAllVotersRef = deleteAllVotersRef;

exports.deleteAllVoters = function deleteAllVoters(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAllVotersRef(dcInstance, inputVars));
}
;

const listAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCandidates', inputVars);
}
listAllCandidatesRef.operationName = 'ListAllCandidates';
exports.listAllCandidatesRef = listAllCandidatesRef;

exports.listAllCandidates = function listAllCandidates(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAllCandidatesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getMemberByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMemberByInfo', inputVars);
}
getMemberByInfoRef.operationName = 'GetMemberByInfo';
exports.getMemberByInfoRef = getMemberByInfoRef;

exports.getMemberByInfo = function getMemberByInfo(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getMemberByInfoRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMember', inputVars);
}
createMemberRef.operationName = 'CreateMember';
exports.createMemberRef = createMemberRef;

exports.createMember = function createMember(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMemberRef(dcInstance, inputVars));
}
;

const updateSystemServiceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSystemService', inputVars);
}
updateSystemServiceRef.operationName = 'UpdateSystemService';
exports.updateSystemServiceRef = updateSystemServiceRef;

exports.updateSystemService = function updateSystemService(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSystemServiceRef(dcInstance, inputVars));
}
;

const createSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurvey', inputVars);
}
createSurveyRef.operationName = 'CreateSurvey';
exports.createSurveyRef = createSurveyRef;

exports.createSurvey = function createSurvey(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSurveyRef(dcInstance, inputVars));
}
;

const getSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSurvey', inputVars);
}
getSurveyRef.operationName = 'GetSurvey';
exports.getSurveyRef = getSurveyRef;

exports.getSurvey = function getSurvey(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSurveyRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const submitSurveyResponseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitSurveyResponse', inputVars);
}
submitSurveyResponseRef.operationName = 'SubmitSurveyResponse';
exports.submitSurveyResponseRef = submitSurveyResponseRef;

exports.submitSurveyResponse = function submitSurveyResponse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(submitSurveyResponseRef(dcInstance, inputVars));
}
;

const deleteSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurvey', inputVars);
}
deleteSurveyRef.operationName = 'DeleteSurvey';
exports.deleteSurveyRef = deleteSurveyRef;

exports.deleteSurvey = function deleteSurvey(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSurveyRef(dcInstance, inputVars));
}
;

const listSurveyQuestionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveyQuestions', inputVars);
}
listSurveyQuestionsRef.operationName = 'ListSurveyQuestions';
exports.listSurveyQuestionsRef = listSurveyQuestionsRef;

exports.listSurveyQuestions = function listSurveyQuestions(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listSurveyQuestionsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurveyQuestion', inputVars);
}
createSurveyQuestionRef.operationName = 'CreateSurveyQuestion';
exports.createSurveyQuestionRef = createSurveyQuestionRef;

exports.createSurveyQuestion = function createSurveyQuestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSurveyQuestionRef(dcInstance, inputVars));
}
;

const updateSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSurveyQuestion', inputVars);
}
updateSurveyQuestionRef.operationName = 'UpdateSurveyQuestion';
exports.updateSurveyQuestionRef = updateSurveyQuestionRef;

exports.updateSurveyQuestion = function updateSurveyQuestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSurveyQuestionRef(dcInstance, inputVars));
}
;

const deleteSurveyQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurveyQuestion', inputVars);
}
deleteSurveyQuestionRef.operationName = 'DeleteSurveyQuestion';
exports.deleteSurveyQuestionRef = deleteSurveyQuestionRef;

exports.deleteSurveyQuestion = function deleteSurveyQuestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSurveyQuestionRef(dcInstance, inputVars));
}
;
