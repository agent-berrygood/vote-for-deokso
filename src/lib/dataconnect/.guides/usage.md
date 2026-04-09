# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getSystemSetting, listSurveys, getVoterByInfo, getElectionSettings, listCandidatesByPosition, listCandidatesByRound, submitVote, updateCandidateVote, listVoters, createVoter } from '@vote/dataconnect';


// Operation GetSystemSetting:  For variables, look at type GetSystemSettingVars in ../index.d.ts
const { data } = await GetSystemSetting(dataConnect, getSystemSettingVars);

// Operation ListSurveys: 
const { data } = await ListSurveys(dataConnect);

// Operation GetVoterByInfo:  For variables, look at type GetVoterByInfoVars in ../index.d.ts
const { data } = await GetVoterByInfo(dataConnect, getVoterByInfoVars);

// Operation GetElectionSettings:  For variables, look at type GetElectionSettingsVars in ../index.d.ts
const { data } = await GetElectionSettings(dataConnect, getElectionSettingsVars);

// Operation ListCandidatesByPosition:  For variables, look at type ListCandidatesByPositionVars in ../index.d.ts
const { data } = await ListCandidatesByPosition(dataConnect, listCandidatesByPositionVars);

// Operation ListCandidatesByRound:  For variables, look at type ListCandidatesByRoundVars in ../index.d.ts
const { data } = await ListCandidatesByRound(dataConnect, listCandidatesByRoundVars);

// Operation SubmitVote:  For variables, look at type SubmitVoteVars in ../index.d.ts
const { data } = await SubmitVote(dataConnect, submitVoteVars);

// Operation UpdateCandidateVote:  For variables, look at type UpdateCandidateVoteVars in ../index.d.ts
const { data } = await UpdateCandidateVote(dataConnect, updateCandidateVoteVars);

// Operation ListVoters:  For variables, look at type ListVotersVars in ../index.d.ts
const { data } = await ListVoters(dataConnect, listVotersVars);

// Operation CreateVoter:  For variables, look at type CreateVoterVars in ../index.d.ts
const { data } = await CreateVoter(dataConnect, createVoterVars);


```