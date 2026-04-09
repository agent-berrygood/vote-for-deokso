const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

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

exports.getSystemSetting = function getSystemSetting(dcOrVars, vars) {
  return executeQuery(getSystemSettingRef(dcOrVars, vars));
};

const listSurveysRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSurveys');
}
listSurveysRef.operationName = 'ListSurveys';
exports.listSurveysRef = listSurveysRef;

exports.listSurveys = function listSurveys(dc) {
  return executeQuery(listSurveysRef(dc));
};

const getVoterByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVoterByInfo', inputVars);
}
getVoterByInfoRef.operationName = 'GetVoterByInfo';
exports.getVoterByInfoRef = getVoterByInfoRef;

exports.getVoterByInfo = function getVoterByInfo(dcOrVars, vars) {
  return executeQuery(getVoterByInfoRef(dcOrVars, vars));
};

const getElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetElectionSettings', inputVars);
}
getElectionSettingsRef.operationName = 'GetElectionSettings';
exports.getElectionSettingsRef = getElectionSettingsRef;

exports.getElectionSettings = function getElectionSettings(dcOrVars, vars) {
  return executeQuery(getElectionSettingsRef(dcOrVars, vars));
};

const listCandidatesByPositionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByPosition', inputVars);
}
listCandidatesByPositionRef.operationName = 'ListCandidatesByPosition';
exports.listCandidatesByPositionRef = listCandidatesByPositionRef;

exports.listCandidatesByPosition = function listCandidatesByPosition(dcOrVars, vars) {
  return executeQuery(listCandidatesByPositionRef(dcOrVars, vars));
};

const listCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCandidatesByRound', inputVars);
}
listCandidatesByRoundRef.operationName = 'ListCandidatesByRound';
exports.listCandidatesByRoundRef = listCandidatesByRoundRef;

exports.listCandidatesByRound = function listCandidatesByRound(dcOrVars, vars) {
  return executeQuery(listCandidatesByRoundRef(dcOrVars, vars));
};

const submitVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitVote', inputVars);
}
submitVoteRef.operationName = 'SubmitVote';
exports.submitVoteRef = submitVoteRef;

exports.submitVote = function submitVote(dcOrVars, vars) {
  return executeMutation(submitVoteRef(dcOrVars, vars));
};

const updateCandidateVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidateVote', inputVars);
}
updateCandidateVoteRef.operationName = 'UpdateCandidateVote';
exports.updateCandidateVoteRef = updateCandidateVoteRef;

exports.updateCandidateVote = function updateCandidateVote(dcOrVars, vars) {
  return executeMutation(updateCandidateVoteRef(dcOrVars, vars));
};

const listVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoters', inputVars);
}
listVotersRef.operationName = 'ListVoters';
exports.listVotersRef = listVotersRef;

exports.listVoters = function listVoters(dcOrVars, vars) {
  return executeQuery(listVotersRef(dcOrVars, vars));
};

const createVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVoter', inputVars);
}
createVoterRef.operationName = 'CreateVoter';
exports.createVoterRef = createVoterRef;

exports.createVoter = function createVoter(dcOrVars, vars) {
  return executeMutation(createVoterRef(dcOrVars, vars));
};

const updateVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVoter', inputVars);
}
updateVoterRef.operationName = 'UpdateVoter';
exports.updateVoterRef = updateVoterRef;

exports.updateVoter = function updateVoter(dcOrVars, vars) {
  return executeMutation(updateVoterRef(dcOrVars, vars));
};

const deleteVoterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteVoter', inputVars);
}
deleteVoterRef.operationName = 'DeleteVoter';
exports.deleteVoterRef = deleteVoterRef;

exports.deleteVoter = function deleteVoter(dcOrVars, vars) {
  return executeMutation(deleteVoterRef(dcOrVars, vars));
};

const listVoterParticipationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVoterParticipations', inputVars);
}
listVoterParticipationsRef.operationName = 'ListVoterParticipations';
exports.listVoterParticipationsRef = listVoterParticipationsRef;

exports.listVoterParticipations = function listVoterParticipations(dcOrVars, vars) {
  return executeQuery(listVoterParticipationsRef(dcOrVars, vars));
};

const createCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCandidate', inputVars);
}
createCandidateRef.operationName = 'CreateCandidate';
exports.createCandidateRef = createCandidateRef;

exports.createCandidate = function createCandidate(dcOrVars, vars) {
  return executeMutation(createCandidateRef(dcOrVars, vars));
};

const updateCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidate', inputVars);
}
updateCandidateRef.operationName = 'UpdateCandidate';
exports.updateCandidateRef = updateCandidateRef;

exports.updateCandidate = function updateCandidate(dcOrVars, vars) {
  return executeMutation(updateCandidateRef(dcOrVars, vars));
};

const deleteCandidateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidate', inputVars);
}
deleteCandidateRef.operationName = 'DeleteCandidate';
exports.deleteCandidateRef = deleteCandidateRef;

exports.deleteCandidate = function deleteCandidate(dcOrVars, vars) {
  return executeMutation(deleteCandidateRef(dcOrVars, vars));
};

const deleteCandidatesByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCandidatesByRound', inputVars);
}
deleteCandidatesByRoundRef.operationName = 'DeleteCandidatesByRound';
exports.deleteCandidatesByRoundRef = deleteCandidatesByRoundRef;

exports.deleteCandidatesByRound = function deleteCandidatesByRound(dcOrVars, vars) {
  return executeMutation(deleteCandidatesByRoundRef(dcOrVars, vars));
};

const updateElectionSettingsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateElectionSettings', inputVars);
}
updateElectionSettingsRef.operationName = 'UpdateElectionSettings';
exports.updateElectionSettingsRef = updateElectionSettingsRef;

exports.updateElectionSettings = function updateElectionSettings(dcOrVars, vars) {
  return executeMutation(updateElectionSettingsRef(dcOrVars, vars));
};

const createAdminLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAdminLog', inputVars);
}
createAdminLogRef.operationName = 'CreateAdminLog';
exports.createAdminLogRef = createAdminLogRef;

exports.createAdminLog = function createAdminLog(dcOrVars, vars) {
  return executeMutation(createAdminLogRef(dcOrVars, vars));
};

const createAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuditLog', inputVars);
}
createAuditLogRef.operationName = 'CreateAuditLog';
exports.createAuditLogRef = createAuditLogRef;

exports.createAuditLog = function createAuditLog(dcOrVars, vars) {
  return executeMutation(createAuditLogRef(dcOrVars, vars));
};

const createElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateElection', inputVars);
}
createElectionRef.operationName = 'CreateElection';
exports.createElectionRef = createElectionRef;

exports.createElection = function createElection(dcOrVars, vars) {
  return executeMutation(createElectionRef(dcOrVars, vars));
};

const listElectionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListElections');
}
listElectionsRef.operationName = 'ListElections';
exports.listElectionsRef = listElectionsRef;

exports.listElections = function listElections(dc) {
  return executeQuery(listElectionsRef(dc));
};

const updateActiveElectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateActiveElection', inputVars);
}
updateActiveElectionRef.operationName = 'UpdateActiveElection';
exports.updateActiveElectionRef = updateActiveElectionRef;

exports.updateActiveElection = function updateActiveElection(dcOrVars, vars) {
  return executeMutation(updateActiveElectionRef(dcOrVars, vars));
};

const getResultsByRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetResultsByRound', inputVars);
}
getResultsByRoundRef.operationName = 'GetResultsByRound';
exports.getResultsByRoundRef = getResultsByRoundRef;

exports.getResultsByRound = function getResultsByRound(dcOrVars, vars) {
  return executeQuery(getResultsByRoundRef(dcOrVars, vars));
};

const listAdminLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAdminLogs', inputVars);
}
listAdminLogsRef.operationName = 'ListAdminLogs';
exports.listAdminLogsRef = listAdminLogsRef;

exports.listAdminLogs = function listAdminLogs(dcOrVars, vars) {
  return executeQuery(listAdminLogsRef(dcOrVars, vars));
};

const listAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAuditLogs', inputVars);
}
listAuditLogsRef.operationName = 'ListAuditLogs';
exports.listAuditLogsRef = listAuditLogsRef;

exports.listAuditLogs = function listAuditLogs(dcOrVars, vars) {
  return executeQuery(listAuditLogsRef(dcOrVars, vars));
};

const deleteAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllCandidates', inputVars);
}
deleteAllCandidatesRef.operationName = 'DeleteAllCandidates';
exports.deleteAllCandidatesRef = deleteAllCandidatesRef;

exports.deleteAllCandidates = function deleteAllCandidates(dcOrVars, vars) {
  return executeMutation(deleteAllCandidatesRef(dcOrVars, vars));
};

const deleteAllVotersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAllVoters', inputVars);
}
deleteAllVotersRef.operationName = 'DeleteAllVoters';
exports.deleteAllVotersRef = deleteAllVotersRef;

exports.deleteAllVoters = function deleteAllVoters(dcOrVars, vars) {
  return executeMutation(deleteAllVotersRef(dcOrVars, vars));
};

const listAllCandidatesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCandidates', inputVars);
}
listAllCandidatesRef.operationName = 'ListAllCandidates';
exports.listAllCandidatesRef = listAllCandidatesRef;

exports.listAllCandidates = function listAllCandidates(dcOrVars, vars) {
  return executeQuery(listAllCandidatesRef(dcOrVars, vars));
};

const getMemberByInfoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMemberByInfo', inputVars);
}
getMemberByInfoRef.operationName = 'GetMemberByInfo';
exports.getMemberByInfoRef = getMemberByInfoRef;

exports.getMemberByInfo = function getMemberByInfo(dcOrVars, vars) {
  return executeQuery(getMemberByInfoRef(dcOrVars, vars));
};

const createMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMember', inputVars);
}
createMemberRef.operationName = 'CreateMember';
exports.createMemberRef = createMemberRef;

exports.createMember = function createMember(dcOrVars, vars) {
  return executeMutation(createMemberRef(dcOrVars, vars));
};

const updateSystemServiceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSystemService', inputVars);
}
updateSystemServiceRef.operationName = 'UpdateSystemService';
exports.updateSystemServiceRef = updateSystemServiceRef;

exports.updateSystemService = function updateSystemService(dcOrVars, vars) {
  return executeMutation(updateSystemServiceRef(dcOrVars, vars));
};

const createSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSurvey', inputVars);
}
createSurveyRef.operationName = 'CreateSurvey';
exports.createSurveyRef = createSurveyRef;

exports.createSurvey = function createSurvey(dcOrVars, vars) {
  return executeMutation(createSurveyRef(dcOrVars, vars));
};

const getSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSurvey', inputVars);
}
getSurveyRef.operationName = 'GetSurvey';
exports.getSurveyRef = getSurveyRef;

exports.getSurvey = function getSurvey(dcOrVars, vars) {
  return executeQuery(getSurveyRef(dcOrVars, vars));
};

const submitSurveyResponseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SubmitSurveyResponse', inputVars);
}
submitSurveyResponseRef.operationName = 'SubmitSurveyResponse';
exports.submitSurveyResponseRef = submitSurveyResponseRef;

exports.submitSurveyResponse = function submitSurveyResponse(dcOrVars, vars) {
  return executeMutation(submitSurveyResponseRef(dcOrVars, vars));
};

const deleteSurveyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSurvey', inputVars);
}
deleteSurveyRef.operationName = 'DeleteSurvey';
exports.deleteSurveyRef = deleteSurveyRef;

exports.deleteSurvey = function deleteSurvey(dcOrVars, vars) {
  return executeMutation(deleteSurveyRef(dcOrVars, vars));
};
