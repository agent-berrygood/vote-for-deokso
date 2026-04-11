import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AdminLog_Key {
  id: UUIDString;
  __typename?: 'AdminLog_Key';
}

export interface AuditLog_Key {
  id: UUIDString;
  __typename?: 'AuditLog_Key';
}

export interface Candidate_Key {
  id: UUIDString;
  __typename?: 'Candidate_Key';
}

export interface CreateAdminLogData {
  adminLog_insert: AdminLog_Key;
}

export interface CreateAdminLogVariables {
  electionId: string;
  adminId?: string | null;
  actionType: string;
  description: string;
}

export interface CreateAuditLogData {
  auditLog_insert: AuditLog_Key;
}

export interface CreateAuditLogVariables {
  electionId: string;
  voterId?: string | null;
  voterName?: string | null;
  actionType: string;
  approvedBy?: string | null;
  ipAddress?: string | null;
}

export interface CreateCandidateData {
  candidate_insert: Candidate_Key;
}

export interface CreateCandidateVariables {
  electionId: string;
  name: string;
  position: string;
  round: number;
  district?: string | null;
  birthdate?: string | null;
  photoUrl?: string | null;
  profileDesc?: string | null;
  volunteerInfo?: string | null;
  candidateNumber?: number | null;
}

export interface CreateElectionData {
  election_insert: Election_Key;
}

export interface CreateElectionVariables {
  id: string;
  name?: string | null;
  maxVotes: number;
}

export interface CreateMemberData {
  member_insert: Member_Key;
}

export interface CreateMemberVariables {
  name: string;
  phone?: string | null;
  birthdate?: string | null;
  originalId?: string | null;
  isSelfRegistered?: boolean | null;
}

export interface CreateSurveyData {
  survey_insert: Survey_Key;
}

export interface CreateSurveyQuestionData {
  surveyQuestion_insert: SurveyQuestion_Key;
}

export interface CreateSurveyQuestionVariables {
  surveyId: UUIDString;
  sectionId?: UUIDString | null;
  text: string;
  type: string;
  options?: string | null;
  maxChoices?: number | null;
  logic?: string | null;
  orderIdx: number;
}

export interface CreateSurveySectionData {
  surveySection_insert: SurveySection_Key;
}

export interface CreateSurveySectionVariables {
  surveyId: UUIDString;
  title: string;
  description?: string | null;
  orderIdx: number;
}

export interface CreateSurveyVariables {
  title: string;
  description?: string | null;
}

export interface CreateVoterData {
  voter_insert: Voter_Key;
}

export interface CreateVoterVariables {
  electionId: string;
  name: string;
  phone?: string | null;
  birthdate?: string | null;
  authKey: string;
}

export interface DeleteAllCandidatesData {
  candidate_deleteMany: number;
}

export interface DeleteAllCandidatesVariables {
  electionId: string;
}

export interface DeleteAllVotersData {
  voter_deleteMany: number;
}

export interface DeleteAllVotersVariables {
  electionId: string;
}

export interface DeleteCandidateData {
  candidate_delete?: Candidate_Key | null;
}

export interface DeleteCandidateVariables {
  id: UUIDString;
}

export interface DeleteCandidatesByRoundData {
  candidate_deleteMany: number;
}

export interface DeleteCandidatesByRoundVariables {
  electionId: string;
  position: string;
  round: number;
}

export interface DeleteMemberData {
  member_delete?: Member_Key | null;
}

export interface DeleteMemberVariables {
  id: UUIDString;
}

export interface DeleteSurveyData {
  survey_delete?: Survey_Key | null;
}

export interface DeleteSurveyQuestionData {
  surveyQuestion_delete?: SurveyQuestion_Key | null;
}

export interface DeleteSurveyQuestionVariables {
  id: UUIDString;
}

export interface DeleteSurveyResponseData {
  surveyResponse_delete?: SurveyResponse_Key | null;
}

export interface DeleteSurveyResponseVariables {
  id: UUIDString;
}

export interface DeleteSurveySectionData {
  surveySection_delete?: SurveySection_Key | null;
}

export interface DeleteSurveySectionVariables {
  id: UUIDString;
}

export interface DeleteSurveyVariables {
  id: UUIDString;
}

export interface DeleteVoterData {
  voter_delete?: Voter_Key | null;
}

export interface DeleteVoterVariables {
  id: UUIDString;
}

export interface Election_Key {
  id: string;
  __typename?: 'Election_Key';
}

export interface GetElectionSettingsData {
  election?: {
    id: string;
    name?: string | null;
    maxVotes: number;
    rounds?: string | null;
    roundTitle?: string | null;
    startDate?: TimestampString | null;
    endDate?: TimestampString | null;
  } & Election_Key;
}

export interface GetElectionSettingsVariables {
  electionId: string;
}

export interface GetMemberByBasicInfoData {
  members: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
    isSelfRegistered?: boolean | null;
  } & Member_Key)[];
}

export interface GetMemberByBasicInfoVariables {
  name: string;
  phone: string;
}

export interface GetMemberByInfoData {
  members: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
    isSelfRegistered?: boolean | null;
  } & Member_Key)[];
}

export interface GetMemberByInfoVariables {
  phone: string;
  birthdate: string;
}

export interface GetResultsByRoundData {
  candidates: ({
    id: UUIDString;
    name: string;
    position: string;
    voteCount: number;
    candidateNumber?: number | null;
    birthdate?: string | null;
    photoUrl?: string | null;
    profileDesc?: string | null;
    volunteerInfo?: string | null;
    district?: string | null;
  } & Candidate_Key)[];
}

export interface GetResultsByRoundVariables {
  electionId: string;
  position: string;
  round: number;
}

export interface GetSurveyData {
  survey?: {
    id: UUIDString;
    title: string;
    description?: string | null;
    isActive?: boolean | null;
    startDate?: TimestampString | null;
    endDate?: TimestampString | null;
  } & Survey_Key;
}

export interface GetSurveyResponseByMemberData {
  surveyResponses: ({
    id: UUIDString;
    answers: string;
    submittedAt: TimestampString;
  } & SurveyResponse_Key)[];
}

export interface GetSurveyResponseByMemberVariables {
  surveyId: UUIDString;
  memberId: UUIDString;
}

export interface GetSurveyVariables {
  id: UUIDString;
}

export interface GetSystemSettingData {
  systemSetting?: {
    id: string;
    activeElection: {
      id: string;
      name?: string | null;
    } & Election_Key;
      activeService?: string | null;
      activeSurveyId?: string | null;
  } & SystemSetting_Key;
}

export interface GetSystemSettingVariables {
  id: string;
}

export interface GetVoterByInfoData {
  voters: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
  } & Voter_Key)[];
}

export interface GetVoterByInfoVariables {
  electionId: string;
  phone: string;
  birthdate: string;
}

export interface ListAdminLogsData {
  adminLogs: ({
    id: UUIDString;
    electionId: string;
    adminId?: string | null;
    actionType: string;
    description: string;
    timestamp: TimestampString;
  } & AdminLog_Key)[];
}

export interface ListAdminLogsVariables {
  electionId: string;
}

export interface ListAllCandidatesData {
  candidates: ({
    id: UUIDString;
    name: string;
    position: string;
    birthdate?: string | null;
    photoUrl?: string | null;
    round: number;
    district?: string | null;
    profileDesc?: string | null;
    volunteerInfo?: string | null;
    candidateNumber?: number | null;
    voteCount: number;
  } & Candidate_Key)[];
}

export interface ListAllCandidatesVariables {
  electionId: string;
}

export interface ListAuditLogsData {
  auditLogs: ({
    id: UUIDString;
    voterId?: string | null;
    voterName?: string | null;
    actionType: string;
    approvedBy?: string | null;
    ipAddress?: string | null;
    timestamp: TimestampString;
  } & AuditLog_Key)[];
}

export interface ListAuditLogsVariables {
  electionId: string;
}

export interface ListCandidatesByPositionData {
  candidates: ({
    id: UUIDString;
    name: string;
    position: string;
    birthdate?: string | null;
    photoUrl?: string | null;
    round: number;
    district?: string | null;
    profileDesc?: string | null;
    volunteerInfo?: string | null;
    candidateNumber?: number | null;
    voteCount: number;
  } & Candidate_Key)[];
}

export interface ListCandidatesByPositionVariables {
  electionId: string;
  position: string;
}

export interface ListCandidatesByRoundData {
  candidates: ({
    id: UUIDString;
    name: string;
    position: string;
    birthdate?: string | null;
    photoUrl?: string | null;
    round: number;
    district?: string | null;
    profileDesc?: string | null;
    volunteerInfo?: string | null;
    candidateNumber?: number | null;
    voteCount: number;
  } & Candidate_Key)[];
}

export interface ListCandidatesByRoundVariables {
  electionId: string;
  position: string;
  round: number;
}

export interface ListElectionsData {
  elections: ({
    id: string;
    name?: string | null;
    rounds?: string | null;
  } & Election_Key)[];
}

export interface ListMembersData {
  members: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
    isSelfRegistered?: boolean | null;
    originalId?: string | null;
  } & Member_Key)[];
}

export interface ListSurveyQuestionsData {
  surveyQuestions: ({
    id: UUIDString;
    sectionId?: UUIDString | null;
    text: string;
    type: string;
    options?: string | null;
    maxChoices?: number | null;
    logic?: string | null;
    orderIdx: number;
  } & SurveyQuestion_Key)[];
}

export interface ListSurveyQuestionsVariables {
  surveyId: UUIDString;
}

export interface ListSurveyResponsesData {
  surveyResponses: ({
    id: UUIDString;
    submittedAt: TimestampString;
    answers: string;
    member: {
      id: UUIDString;
      name: string;
      phone?: string | null;
      isSelfRegistered?: boolean | null;
    } & Member_Key;
  } & SurveyResponse_Key)[];
}

export interface ListSurveyResponsesVariables {
  surveyId: UUIDString;
}

export interface ListSurveySectionsData {
  surveySections: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    orderIdx: number;
  } & SurveySection_Key)[];
}

export interface ListSurveySectionsVariables {
  surveyId: UUIDString;
}

export interface ListSurveysData {
  surveys: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    isActive?: boolean | null;
    startDate?: TimestampString | null;
    endDate?: TimestampString | null;
  } & Survey_Key)[];
}

export interface ListVoterParticipationsData {
  voterParticipations: ({
    voterId: UUIDString;
    position: string;
    roundNumber: number;
    votedAt: TimestampString;
  })[];
}

export interface ListVoterParticipationsVariables {
  electionId: string;
}

export interface ListVotersData {
  voters: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
    authKey: string;
  } & Voter_Key)[];
}

export interface ListVotersVariables {
  electionId: string;
}

export interface Member_Key {
  id: UUIDString;
  __typename?: 'Member_Key';
}

export interface SubmitSurveyResponseData {
  surveyResponse_insert: SurveyResponse_Key;
}

export interface SubmitSurveyResponseVariables {
  surveyId: UUIDString;
  memberId: UUIDString;
  answers: string;
}

export interface SubmitVoteData {
  voterParticipation_insert: VoterParticipation_Key;
}

export interface SubmitVoteVariables {
  voterId: UUIDString;
  electionId: string;
  position: string;
  round: number;
}

export interface SurveyQuestion_Key {
  id: UUIDString;
  __typename?: 'SurveyQuestion_Key';
}

export interface SurveyResponse_Key {
  id: UUIDString;
  __typename?: 'SurveyResponse_Key';
}

export interface SurveySection_Key {
  id: UUIDString;
  __typename?: 'SurveySection_Key';
}

export interface Survey_Key {
  id: UUIDString;
  __typename?: 'Survey_Key';
}

export interface SystemSetting_Key {
  id: string;
  __typename?: 'SystemSetting_Key';
}

export interface UpdateActiveElectionData {
  systemSetting_update?: SystemSetting_Key | null;
}

export interface UpdateActiveElectionVariables {
  systemId: string;
  electionId: string;
}

export interface UpdateCandidateData {
  candidate_update?: Candidate_Key | null;
}

export interface UpdateCandidateVariables {
  id: UUIDString;
  name: string;
  position?: string | null;
  round?: number | null;
  district?: string | null;
  birthdate?: string | null;
  photoUrl?: string | null;
  profileDesc?: string | null;
  volunteerInfo?: string | null;
  candidateNumber?: number | null;
}

export interface UpdateCandidateVoteData {
  candidate_update?: Candidate_Key | null;
}

export interface UpdateCandidateVoteVariables {
  candidateId: UUIDString;
  newCount: number;
}

export interface UpdateElectionSettingsData {
  election_update?: Election_Key | null;
}

export interface UpdateElectionSettingsVariables {
  id: string;
  name?: string | null;
  maxVotes: number;
  rounds?: string | null;
  roundTitle?: string | null;
  startDate?: TimestampString | null;
  endDate?: TimestampString | null;
}

export interface UpdateMemberData {
  member_update?: Member_Key | null;
}

export interface UpdateMemberVariables {
  id: UUIDString;
  name?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  isSelfRegistered?: boolean | null;
}

export interface UpdateSurveyData {
  survey_update?: Survey_Key | null;
}

export interface UpdateSurveyQuestionData {
  surveyQuestion_update?: SurveyQuestion_Key | null;
}

export interface UpdateSurveyQuestionVariables {
  id: UUIDString;
  sectionId?: UUIDString | null;
  text?: string | null;
  type?: string | null;
  options?: string | null;
  maxChoices?: number | null;
  logic?: string | null;
  orderIdx?: number | null;
}

export interface UpdateSurveyResponseData {
  surveyResponse_update?: SurveyResponse_Key | null;
}

export interface UpdateSurveyResponseVariables {
  id: UUIDString;
  answers: string;
}

export interface UpdateSurveySectionData {
  surveySection_update?: SurveySection_Key | null;
}

export interface UpdateSurveySectionVariables {
  id: UUIDString;
  title?: string | null;
  description?: string | null;
  orderIdx?: number | null;
}

export interface UpdateSurveyVariables {
  id: UUIDString;
  title?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  startDate?: TimestampString | null;
  endDate?: TimestampString | null;
}

export interface UpdateSystemServiceData {
  systemSetting_update?: SystemSetting_Key | null;
}

export interface UpdateSystemServiceVariables {
  systemId: string;
  activeService?: string | null;
  activeSurveyId?: string | null;
}

export interface UpdateVoterData {
  voter_update?: Voter_Key | null;
}

export interface UpdateVoterVariables {
  id: UUIDString;
  name: string;
  phone?: string | null;
  birthdate?: string | null;
}

export interface VoterParticipation_Key {
  id: UUIDString;
  __typename?: 'VoterParticipation_Key';
}

export interface Voter_Key {
  id: UUIDString;
  __typename?: 'Voter_Key';
}

interface GetSystemSettingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSystemSettingVariables): QueryRef<GetSystemSettingData, GetSystemSettingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSystemSettingVariables): QueryRef<GetSystemSettingData, GetSystemSettingVariables>;
  operationName: string;
}
export const getSystemSettingRef: GetSystemSettingRef;

export function getSystemSetting(vars: GetSystemSettingVariables): QueryPromise<GetSystemSettingData, GetSystemSettingVariables>;
export function getSystemSetting(dc: DataConnect, vars: GetSystemSettingVariables): QueryPromise<GetSystemSettingData, GetSystemSettingVariables>;

interface ListSurveysRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSurveysData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSurveysData, undefined>;
  operationName: string;
}
export const listSurveysRef: ListSurveysRef;

export function listSurveys(): QueryPromise<ListSurveysData, undefined>;
export function listSurveys(dc: DataConnect): QueryPromise<ListSurveysData, undefined>;

interface GetVoterByInfoRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVoterByInfoVariables): QueryRef<GetVoterByInfoData, GetVoterByInfoVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetVoterByInfoVariables): QueryRef<GetVoterByInfoData, GetVoterByInfoVariables>;
  operationName: string;
}
export const getVoterByInfoRef: GetVoterByInfoRef;

export function getVoterByInfo(vars: GetVoterByInfoVariables): QueryPromise<GetVoterByInfoData, GetVoterByInfoVariables>;
export function getVoterByInfo(dc: DataConnect, vars: GetVoterByInfoVariables): QueryPromise<GetVoterByInfoData, GetVoterByInfoVariables>;

interface GetElectionSettingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetElectionSettingsVariables): QueryRef<GetElectionSettingsData, GetElectionSettingsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetElectionSettingsVariables): QueryRef<GetElectionSettingsData, GetElectionSettingsVariables>;
  operationName: string;
}
export const getElectionSettingsRef: GetElectionSettingsRef;

export function getElectionSettings(vars: GetElectionSettingsVariables): QueryPromise<GetElectionSettingsData, GetElectionSettingsVariables>;
export function getElectionSettings(dc: DataConnect, vars: GetElectionSettingsVariables): QueryPromise<GetElectionSettingsData, GetElectionSettingsVariables>;

interface ListCandidatesByPositionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCandidatesByPositionVariables): QueryRef<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListCandidatesByPositionVariables): QueryRef<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;
  operationName: string;
}
export const listCandidatesByPositionRef: ListCandidatesByPositionRef;

export function listCandidatesByPosition(vars: ListCandidatesByPositionVariables): QueryPromise<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;
export function listCandidatesByPosition(dc: DataConnect, vars: ListCandidatesByPositionVariables): QueryPromise<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;

interface ListCandidatesByRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCandidatesByRoundVariables): QueryRef<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListCandidatesByRoundVariables): QueryRef<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;
  operationName: string;
}
export const listCandidatesByRoundRef: ListCandidatesByRoundRef;

export function listCandidatesByRound(vars: ListCandidatesByRoundVariables): QueryPromise<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;
export function listCandidatesByRound(dc: DataConnect, vars: ListCandidatesByRoundVariables): QueryPromise<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;

interface SubmitVoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitVoteVariables): MutationRef<SubmitVoteData, SubmitVoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SubmitVoteVariables): MutationRef<SubmitVoteData, SubmitVoteVariables>;
  operationName: string;
}
export const submitVoteRef: SubmitVoteRef;

export function submitVote(vars: SubmitVoteVariables): MutationPromise<SubmitVoteData, SubmitVoteVariables>;
export function submitVote(dc: DataConnect, vars: SubmitVoteVariables): MutationPromise<SubmitVoteData, SubmitVoteVariables>;

interface UpdateCandidateVoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCandidateVoteVariables): MutationRef<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCandidateVoteVariables): MutationRef<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;
  operationName: string;
}
export const updateCandidateVoteRef: UpdateCandidateVoteRef;

export function updateCandidateVote(vars: UpdateCandidateVoteVariables): MutationPromise<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;
export function updateCandidateVote(dc: DataConnect, vars: UpdateCandidateVoteVariables): MutationPromise<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;

interface ListVotersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListVotersVariables): QueryRef<ListVotersData, ListVotersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListVotersVariables): QueryRef<ListVotersData, ListVotersVariables>;
  operationName: string;
}
export const listVotersRef: ListVotersRef;

export function listVoters(vars: ListVotersVariables): QueryPromise<ListVotersData, ListVotersVariables>;
export function listVoters(dc: DataConnect, vars: ListVotersVariables): QueryPromise<ListVotersData, ListVotersVariables>;

interface CreateVoterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVoterVariables): MutationRef<CreateVoterData, CreateVoterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateVoterVariables): MutationRef<CreateVoterData, CreateVoterVariables>;
  operationName: string;
}
export const createVoterRef: CreateVoterRef;

export function createVoter(vars: CreateVoterVariables): MutationPromise<CreateVoterData, CreateVoterVariables>;
export function createVoter(dc: DataConnect, vars: CreateVoterVariables): MutationPromise<CreateVoterData, CreateVoterVariables>;

interface UpdateVoterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVoterVariables): MutationRef<UpdateVoterData, UpdateVoterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateVoterVariables): MutationRef<UpdateVoterData, UpdateVoterVariables>;
  operationName: string;
}
export const updateVoterRef: UpdateVoterRef;

export function updateVoter(vars: UpdateVoterVariables): MutationPromise<UpdateVoterData, UpdateVoterVariables>;
export function updateVoter(dc: DataConnect, vars: UpdateVoterVariables): MutationPromise<UpdateVoterData, UpdateVoterVariables>;

interface DeleteVoterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteVoterVariables): MutationRef<DeleteVoterData, DeleteVoterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteVoterVariables): MutationRef<DeleteVoterData, DeleteVoterVariables>;
  operationName: string;
}
export const deleteVoterRef: DeleteVoterRef;

export function deleteVoter(vars: DeleteVoterVariables): MutationPromise<DeleteVoterData, DeleteVoterVariables>;
export function deleteVoter(dc: DataConnect, vars: DeleteVoterVariables): MutationPromise<DeleteVoterData, DeleteVoterVariables>;

interface ListVoterParticipationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListVoterParticipationsVariables): QueryRef<ListVoterParticipationsData, ListVoterParticipationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListVoterParticipationsVariables): QueryRef<ListVoterParticipationsData, ListVoterParticipationsVariables>;
  operationName: string;
}
export const listVoterParticipationsRef: ListVoterParticipationsRef;

export function listVoterParticipations(vars: ListVoterParticipationsVariables): QueryPromise<ListVoterParticipationsData, ListVoterParticipationsVariables>;
export function listVoterParticipations(dc: DataConnect, vars: ListVoterParticipationsVariables): QueryPromise<ListVoterParticipationsData, ListVoterParticipationsVariables>;

interface CreateCandidateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCandidateVariables): MutationRef<CreateCandidateData, CreateCandidateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCandidateVariables): MutationRef<CreateCandidateData, CreateCandidateVariables>;
  operationName: string;
}
export const createCandidateRef: CreateCandidateRef;

export function createCandidate(vars: CreateCandidateVariables): MutationPromise<CreateCandidateData, CreateCandidateVariables>;
export function createCandidate(dc: DataConnect, vars: CreateCandidateVariables): MutationPromise<CreateCandidateData, CreateCandidateVariables>;

interface UpdateCandidateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCandidateVariables): MutationRef<UpdateCandidateData, UpdateCandidateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCandidateVariables): MutationRef<UpdateCandidateData, UpdateCandidateVariables>;
  operationName: string;
}
export const updateCandidateRef: UpdateCandidateRef;

export function updateCandidate(vars: UpdateCandidateVariables): MutationPromise<UpdateCandidateData, UpdateCandidateVariables>;
export function updateCandidate(dc: DataConnect, vars: UpdateCandidateVariables): MutationPromise<UpdateCandidateData, UpdateCandidateVariables>;

interface DeleteCandidateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCandidateVariables): MutationRef<DeleteCandidateData, DeleteCandidateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCandidateVariables): MutationRef<DeleteCandidateData, DeleteCandidateVariables>;
  operationName: string;
}
export const deleteCandidateRef: DeleteCandidateRef;

export function deleteCandidate(vars: DeleteCandidateVariables): MutationPromise<DeleteCandidateData, DeleteCandidateVariables>;
export function deleteCandidate(dc: DataConnect, vars: DeleteCandidateVariables): MutationPromise<DeleteCandidateData, DeleteCandidateVariables>;

interface DeleteCandidatesByRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCandidatesByRoundVariables): MutationRef<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCandidatesByRoundVariables): MutationRef<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;
  operationName: string;
}
export const deleteCandidatesByRoundRef: DeleteCandidatesByRoundRef;

export function deleteCandidatesByRound(vars: DeleteCandidatesByRoundVariables): MutationPromise<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;
export function deleteCandidatesByRound(dc: DataConnect, vars: DeleteCandidatesByRoundVariables): MutationPromise<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;

interface UpdateElectionSettingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateElectionSettingsVariables): MutationRef<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateElectionSettingsVariables): MutationRef<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;
  operationName: string;
}
export const updateElectionSettingsRef: UpdateElectionSettingsRef;

export function updateElectionSettings(vars: UpdateElectionSettingsVariables): MutationPromise<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;
export function updateElectionSettings(dc: DataConnect, vars: UpdateElectionSettingsVariables): MutationPromise<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;

interface CreateAdminLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAdminLogVariables): MutationRef<CreateAdminLogData, CreateAdminLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAdminLogVariables): MutationRef<CreateAdminLogData, CreateAdminLogVariables>;
  operationName: string;
}
export const createAdminLogRef: CreateAdminLogRef;

export function createAdminLog(vars: CreateAdminLogVariables): MutationPromise<CreateAdminLogData, CreateAdminLogVariables>;
export function createAdminLog(dc: DataConnect, vars: CreateAdminLogVariables): MutationPromise<CreateAdminLogData, CreateAdminLogVariables>;

interface CreateAuditLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
  operationName: string;
}
export const createAuditLogRef: CreateAuditLogRef;

export function createAuditLog(vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;
export function createAuditLog(dc: DataConnect, vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface CreateElectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateElectionVariables): MutationRef<CreateElectionData, CreateElectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateElectionVariables): MutationRef<CreateElectionData, CreateElectionVariables>;
  operationName: string;
}
export const createElectionRef: CreateElectionRef;

export function createElection(vars: CreateElectionVariables): MutationPromise<CreateElectionData, CreateElectionVariables>;
export function createElection(dc: DataConnect, vars: CreateElectionVariables): MutationPromise<CreateElectionData, CreateElectionVariables>;

interface ListElectionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListElectionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListElectionsData, undefined>;
  operationName: string;
}
export const listElectionsRef: ListElectionsRef;

export function listElections(): QueryPromise<ListElectionsData, undefined>;
export function listElections(dc: DataConnect): QueryPromise<ListElectionsData, undefined>;

interface UpdateActiveElectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateActiveElectionVariables): MutationRef<UpdateActiveElectionData, UpdateActiveElectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateActiveElectionVariables): MutationRef<UpdateActiveElectionData, UpdateActiveElectionVariables>;
  operationName: string;
}
export const updateActiveElectionRef: UpdateActiveElectionRef;

export function updateActiveElection(vars: UpdateActiveElectionVariables): MutationPromise<UpdateActiveElectionData, UpdateActiveElectionVariables>;
export function updateActiveElection(dc: DataConnect, vars: UpdateActiveElectionVariables): MutationPromise<UpdateActiveElectionData, UpdateActiveElectionVariables>;

interface GetResultsByRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetResultsByRoundVariables): QueryRef<GetResultsByRoundData, GetResultsByRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetResultsByRoundVariables): QueryRef<GetResultsByRoundData, GetResultsByRoundVariables>;
  operationName: string;
}
export const getResultsByRoundRef: GetResultsByRoundRef;

export function getResultsByRound(vars: GetResultsByRoundVariables): QueryPromise<GetResultsByRoundData, GetResultsByRoundVariables>;
export function getResultsByRound(dc: DataConnect, vars: GetResultsByRoundVariables): QueryPromise<GetResultsByRoundData, GetResultsByRoundVariables>;

interface ListAdminLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAdminLogsVariables): QueryRef<ListAdminLogsData, ListAdminLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAdminLogsVariables): QueryRef<ListAdminLogsData, ListAdminLogsVariables>;
  operationName: string;
}
export const listAdminLogsRef: ListAdminLogsRef;

export function listAdminLogs(vars: ListAdminLogsVariables): QueryPromise<ListAdminLogsData, ListAdminLogsVariables>;
export function listAdminLogs(dc: DataConnect, vars: ListAdminLogsVariables): QueryPromise<ListAdminLogsData, ListAdminLogsVariables>;

interface ListAuditLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAuditLogsVariables): QueryRef<ListAuditLogsData, ListAuditLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAuditLogsVariables): QueryRef<ListAuditLogsData, ListAuditLogsVariables>;
  operationName: string;
}
export const listAuditLogsRef: ListAuditLogsRef;

export function listAuditLogs(vars: ListAuditLogsVariables): QueryPromise<ListAuditLogsData, ListAuditLogsVariables>;
export function listAuditLogs(dc: DataConnect, vars: ListAuditLogsVariables): QueryPromise<ListAuditLogsData, ListAuditLogsVariables>;

interface DeleteAllCandidatesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAllCandidatesVariables): MutationRef<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAllCandidatesVariables): MutationRef<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;
  operationName: string;
}
export const deleteAllCandidatesRef: DeleteAllCandidatesRef;

export function deleteAllCandidates(vars: DeleteAllCandidatesVariables): MutationPromise<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;
export function deleteAllCandidates(dc: DataConnect, vars: DeleteAllCandidatesVariables): MutationPromise<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;

interface DeleteAllVotersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAllVotersVariables): MutationRef<DeleteAllVotersData, DeleteAllVotersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAllVotersVariables): MutationRef<DeleteAllVotersData, DeleteAllVotersVariables>;
  operationName: string;
}
export const deleteAllVotersRef: DeleteAllVotersRef;

export function deleteAllVoters(vars: DeleteAllVotersVariables): MutationPromise<DeleteAllVotersData, DeleteAllVotersVariables>;
export function deleteAllVoters(dc: DataConnect, vars: DeleteAllVotersVariables): MutationPromise<DeleteAllVotersData, DeleteAllVotersVariables>;

interface ListAllCandidatesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAllCandidatesVariables): QueryRef<ListAllCandidatesData, ListAllCandidatesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAllCandidatesVariables): QueryRef<ListAllCandidatesData, ListAllCandidatesVariables>;
  operationName: string;
}
export const listAllCandidatesRef: ListAllCandidatesRef;

export function listAllCandidates(vars: ListAllCandidatesVariables): QueryPromise<ListAllCandidatesData, ListAllCandidatesVariables>;
export function listAllCandidates(dc: DataConnect, vars: ListAllCandidatesVariables): QueryPromise<ListAllCandidatesData, ListAllCandidatesVariables>;

interface GetMemberByInfoRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMemberByInfoVariables): QueryRef<GetMemberByInfoData, GetMemberByInfoVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMemberByInfoVariables): QueryRef<GetMemberByInfoData, GetMemberByInfoVariables>;
  operationName: string;
}
export const getMemberByInfoRef: GetMemberByInfoRef;

export function getMemberByInfo(vars: GetMemberByInfoVariables): QueryPromise<GetMemberByInfoData, GetMemberByInfoVariables>;
export function getMemberByInfo(dc: DataConnect, vars: GetMemberByInfoVariables): QueryPromise<GetMemberByInfoData, GetMemberByInfoVariables>;

interface GetMemberByBasicInfoRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMemberByBasicInfoVariables): QueryRef<GetMemberByBasicInfoData, GetMemberByBasicInfoVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMemberByBasicInfoVariables): QueryRef<GetMemberByBasicInfoData, GetMemberByBasicInfoVariables>;
  operationName: string;
}
export const getMemberByBasicInfoRef: GetMemberByBasicInfoRef;

export function getMemberByBasicInfo(vars: GetMemberByBasicInfoVariables): QueryPromise<GetMemberByBasicInfoData, GetMemberByBasicInfoVariables>;
export function getMemberByBasicInfo(dc: DataConnect, vars: GetMemberByBasicInfoVariables): QueryPromise<GetMemberByBasicInfoData, GetMemberByBasicInfoVariables>;

interface ListMembersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMembersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMembersData, undefined>;
  operationName: string;
}
export const listMembersRef: ListMembersRef;

export function listMembers(): QueryPromise<ListMembersData, undefined>;
export function listMembers(dc: DataConnect): QueryPromise<ListMembersData, undefined>;

interface CreateMemberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMemberVariables): MutationRef<CreateMemberData, CreateMemberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMemberVariables): MutationRef<CreateMemberData, CreateMemberVariables>;
  operationName: string;
}
export const createMemberRef: CreateMemberRef;

export function createMember(vars: CreateMemberVariables): MutationPromise<CreateMemberData, CreateMemberVariables>;
export function createMember(dc: DataConnect, vars: CreateMemberVariables): MutationPromise<CreateMemberData, CreateMemberVariables>;

interface UpdateMemberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMemberVariables): MutationRef<UpdateMemberData, UpdateMemberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMemberVariables): MutationRef<UpdateMemberData, UpdateMemberVariables>;
  operationName: string;
}
export const updateMemberRef: UpdateMemberRef;

export function updateMember(vars: UpdateMemberVariables): MutationPromise<UpdateMemberData, UpdateMemberVariables>;
export function updateMember(dc: DataConnect, vars: UpdateMemberVariables): MutationPromise<UpdateMemberData, UpdateMemberVariables>;

interface DeleteMemberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMemberVariables): MutationRef<DeleteMemberData, DeleteMemberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteMemberVariables): MutationRef<DeleteMemberData, DeleteMemberVariables>;
  operationName: string;
}
export const deleteMemberRef: DeleteMemberRef;

export function deleteMember(vars: DeleteMemberVariables): MutationPromise<DeleteMemberData, DeleteMemberVariables>;
export function deleteMember(dc: DataConnect, vars: DeleteMemberVariables): MutationPromise<DeleteMemberData, DeleteMemberVariables>;

interface UpdateSystemServiceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSystemServiceVariables): MutationRef<UpdateSystemServiceData, UpdateSystemServiceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSystemServiceVariables): MutationRef<UpdateSystemServiceData, UpdateSystemServiceVariables>;
  operationName: string;
}
export const updateSystemServiceRef: UpdateSystemServiceRef;

export function updateSystemService(vars: UpdateSystemServiceVariables): MutationPromise<UpdateSystemServiceData, UpdateSystemServiceVariables>;
export function updateSystemService(dc: DataConnect, vars: UpdateSystemServiceVariables): MutationPromise<UpdateSystemServiceData, UpdateSystemServiceVariables>;

interface CreateSurveyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSurveyVariables): MutationRef<CreateSurveyData, CreateSurveyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSurveyVariables): MutationRef<CreateSurveyData, CreateSurveyVariables>;
  operationName: string;
}
export const createSurveyRef: CreateSurveyRef;

export function createSurvey(vars: CreateSurveyVariables): MutationPromise<CreateSurveyData, CreateSurveyVariables>;
export function createSurvey(dc: DataConnect, vars: CreateSurveyVariables): MutationPromise<CreateSurveyData, CreateSurveyVariables>;

interface GetSurveyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSurveyVariables): QueryRef<GetSurveyData, GetSurveyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSurveyVariables): QueryRef<GetSurveyData, GetSurveyVariables>;
  operationName: string;
}
export const getSurveyRef: GetSurveyRef;

export function getSurvey(vars: GetSurveyVariables): QueryPromise<GetSurveyData, GetSurveyVariables>;
export function getSurvey(dc: DataConnect, vars: GetSurveyVariables): QueryPromise<GetSurveyData, GetSurveyVariables>;

interface UpdateSurveyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSurveyVariables): MutationRef<UpdateSurveyData, UpdateSurveyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSurveyVariables): MutationRef<UpdateSurveyData, UpdateSurveyVariables>;
  operationName: string;
}
export const updateSurveyRef: UpdateSurveyRef;

export function updateSurvey(vars: UpdateSurveyVariables): MutationPromise<UpdateSurveyData, UpdateSurveyVariables>;
export function updateSurvey(dc: DataConnect, vars: UpdateSurveyVariables): MutationPromise<UpdateSurveyData, UpdateSurveyVariables>;

interface SubmitSurveyResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitSurveyResponseVariables): MutationRef<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SubmitSurveyResponseVariables): MutationRef<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;
  operationName: string;
}
export const submitSurveyResponseRef: SubmitSurveyResponseRef;

export function submitSurveyResponse(vars: SubmitSurveyResponseVariables): MutationPromise<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;
export function submitSurveyResponse(dc: DataConnect, vars: SubmitSurveyResponseVariables): MutationPromise<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;

interface UpdateSurveyResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSurveyResponseVariables): MutationRef<UpdateSurveyResponseData, UpdateSurveyResponseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSurveyResponseVariables): MutationRef<UpdateSurveyResponseData, UpdateSurveyResponseVariables>;
  operationName: string;
}
export const updateSurveyResponseRef: UpdateSurveyResponseRef;

export function updateSurveyResponse(vars: UpdateSurveyResponseVariables): MutationPromise<UpdateSurveyResponseData, UpdateSurveyResponseVariables>;
export function updateSurveyResponse(dc: DataConnect, vars: UpdateSurveyResponseVariables): MutationPromise<UpdateSurveyResponseData, UpdateSurveyResponseVariables>;

interface GetSurveyResponseByMemberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSurveyResponseByMemberVariables): QueryRef<GetSurveyResponseByMemberData, GetSurveyResponseByMemberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSurveyResponseByMemberVariables): QueryRef<GetSurveyResponseByMemberData, GetSurveyResponseByMemberVariables>;
  operationName: string;
}
export const getSurveyResponseByMemberRef: GetSurveyResponseByMemberRef;

export function getSurveyResponseByMember(vars: GetSurveyResponseByMemberVariables): QueryPromise<GetSurveyResponseByMemberData, GetSurveyResponseByMemberVariables>;
export function getSurveyResponseByMember(dc: DataConnect, vars: GetSurveyResponseByMemberVariables): QueryPromise<GetSurveyResponseByMemberData, GetSurveyResponseByMemberVariables>;

interface ListSurveyResponsesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListSurveyResponsesVariables): QueryRef<ListSurveyResponsesData, ListSurveyResponsesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListSurveyResponsesVariables): QueryRef<ListSurveyResponsesData, ListSurveyResponsesVariables>;
  operationName: string;
}
export const listSurveyResponsesRef: ListSurveyResponsesRef;

export function listSurveyResponses(vars: ListSurveyResponsesVariables): QueryPromise<ListSurveyResponsesData, ListSurveyResponsesVariables>;
export function listSurveyResponses(dc: DataConnect, vars: ListSurveyResponsesVariables): QueryPromise<ListSurveyResponsesData, ListSurveyResponsesVariables>;

interface DeleteSurveyResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSurveyResponseVariables): MutationRef<DeleteSurveyResponseData, DeleteSurveyResponseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSurveyResponseVariables): MutationRef<DeleteSurveyResponseData, DeleteSurveyResponseVariables>;
  operationName: string;
}
export const deleteSurveyResponseRef: DeleteSurveyResponseRef;

export function deleteSurveyResponse(vars: DeleteSurveyResponseVariables): MutationPromise<DeleteSurveyResponseData, DeleteSurveyResponseVariables>;
export function deleteSurveyResponse(dc: DataConnect, vars: DeleteSurveyResponseVariables): MutationPromise<DeleteSurveyResponseData, DeleteSurveyResponseVariables>;

interface DeleteSurveyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSurveyVariables): MutationRef<DeleteSurveyData, DeleteSurveyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSurveyVariables): MutationRef<DeleteSurveyData, DeleteSurveyVariables>;
  operationName: string;
}
export const deleteSurveyRef: DeleteSurveyRef;

export function deleteSurvey(vars: DeleteSurveyVariables): MutationPromise<DeleteSurveyData, DeleteSurveyVariables>;
export function deleteSurvey(dc: DataConnect, vars: DeleteSurveyVariables): MutationPromise<DeleteSurveyData, DeleteSurveyVariables>;

interface ListSurveySectionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListSurveySectionsVariables): QueryRef<ListSurveySectionsData, ListSurveySectionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListSurveySectionsVariables): QueryRef<ListSurveySectionsData, ListSurveySectionsVariables>;
  operationName: string;
}
export const listSurveySectionsRef: ListSurveySectionsRef;

export function listSurveySections(vars: ListSurveySectionsVariables): QueryPromise<ListSurveySectionsData, ListSurveySectionsVariables>;
export function listSurveySections(dc: DataConnect, vars: ListSurveySectionsVariables): QueryPromise<ListSurveySectionsData, ListSurveySectionsVariables>;

interface CreateSurveySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSurveySectionVariables): MutationRef<CreateSurveySectionData, CreateSurveySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSurveySectionVariables): MutationRef<CreateSurveySectionData, CreateSurveySectionVariables>;
  operationName: string;
}
export const createSurveySectionRef: CreateSurveySectionRef;

export function createSurveySection(vars: CreateSurveySectionVariables): MutationPromise<CreateSurveySectionData, CreateSurveySectionVariables>;
export function createSurveySection(dc: DataConnect, vars: CreateSurveySectionVariables): MutationPromise<CreateSurveySectionData, CreateSurveySectionVariables>;

interface UpdateSurveySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSurveySectionVariables): MutationRef<UpdateSurveySectionData, UpdateSurveySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSurveySectionVariables): MutationRef<UpdateSurveySectionData, UpdateSurveySectionVariables>;
  operationName: string;
}
export const updateSurveySectionRef: UpdateSurveySectionRef;

export function updateSurveySection(vars: UpdateSurveySectionVariables): MutationPromise<UpdateSurveySectionData, UpdateSurveySectionVariables>;
export function updateSurveySection(dc: DataConnect, vars: UpdateSurveySectionVariables): MutationPromise<UpdateSurveySectionData, UpdateSurveySectionVariables>;

interface DeleteSurveySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSurveySectionVariables): MutationRef<DeleteSurveySectionData, DeleteSurveySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSurveySectionVariables): MutationRef<DeleteSurveySectionData, DeleteSurveySectionVariables>;
  operationName: string;
}
export const deleteSurveySectionRef: DeleteSurveySectionRef;

export function deleteSurveySection(vars: DeleteSurveySectionVariables): MutationPromise<DeleteSurveySectionData, DeleteSurveySectionVariables>;
export function deleteSurveySection(dc: DataConnect, vars: DeleteSurveySectionVariables): MutationPromise<DeleteSurveySectionData, DeleteSurveySectionVariables>;

interface ListSurveyQuestionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListSurveyQuestionsVariables): QueryRef<ListSurveyQuestionsData, ListSurveyQuestionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListSurveyQuestionsVariables): QueryRef<ListSurveyQuestionsData, ListSurveyQuestionsVariables>;
  operationName: string;
}
export const listSurveyQuestionsRef: ListSurveyQuestionsRef;

export function listSurveyQuestions(vars: ListSurveyQuestionsVariables): QueryPromise<ListSurveyQuestionsData, ListSurveyQuestionsVariables>;
export function listSurveyQuestions(dc: DataConnect, vars: ListSurveyQuestionsVariables): QueryPromise<ListSurveyQuestionsData, ListSurveyQuestionsVariables>;

interface CreateSurveyQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSurveyQuestionVariables): MutationRef<CreateSurveyQuestionData, CreateSurveyQuestionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSurveyQuestionVariables): MutationRef<CreateSurveyQuestionData, CreateSurveyQuestionVariables>;
  operationName: string;
}
export const createSurveyQuestionRef: CreateSurveyQuestionRef;

export function createSurveyQuestion(vars: CreateSurveyQuestionVariables): MutationPromise<CreateSurveyQuestionData, CreateSurveyQuestionVariables>;
export function createSurveyQuestion(dc: DataConnect, vars: CreateSurveyQuestionVariables): MutationPromise<CreateSurveyQuestionData, CreateSurveyQuestionVariables>;

interface UpdateSurveyQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSurveyQuestionVariables): MutationRef<UpdateSurveyQuestionData, UpdateSurveyQuestionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSurveyQuestionVariables): MutationRef<UpdateSurveyQuestionData, UpdateSurveyQuestionVariables>;
  operationName: string;
}
export const updateSurveyQuestionRef: UpdateSurveyQuestionRef;

export function updateSurveyQuestion(vars: UpdateSurveyQuestionVariables): MutationPromise<UpdateSurveyQuestionData, UpdateSurveyQuestionVariables>;
export function updateSurveyQuestion(dc: DataConnect, vars: UpdateSurveyQuestionVariables): MutationPromise<UpdateSurveyQuestionData, UpdateSurveyQuestionVariables>;

interface DeleteSurveyQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSurveyQuestionVariables): MutationRef<DeleteSurveyQuestionData, DeleteSurveyQuestionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSurveyQuestionVariables): MutationRef<DeleteSurveyQuestionData, DeleteSurveyQuestionVariables>;
  operationName: string;
}
export const deleteSurveyQuestionRef: DeleteSurveyQuestionRef;

export function deleteSurveyQuestion(vars: DeleteSurveyQuestionVariables): MutationPromise<DeleteSurveyQuestionData, DeleteSurveyQuestionVariables>;
export function deleteSurveyQuestion(dc: DataConnect, vars: DeleteSurveyQuestionVariables): MutationPromise<DeleteSurveyQuestionData, DeleteSurveyQuestionVariables>;

