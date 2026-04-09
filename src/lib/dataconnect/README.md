# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `vote`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetSystemSetting*](#getsystemsetting)
  - [*GetVoterByInfo*](#getvoterbyinfo)
  - [*GetElectionSettings*](#getelectionsettings)
  - [*ListCandidatesByPosition*](#listcandidatesbyposition)
  - [*ListCandidatesByRound*](#listcandidatesbyround)
  - [*ListVoters*](#listvoters)
  - [*ListVoterParticipations*](#listvoterparticipations)
  - [*ListElections*](#listelections)
  - [*GetResultsByRound*](#getresultsbyround)
  - [*ListAdminLogs*](#listadminlogs)
  - [*ListAuditLogs*](#listauditlogs)
  - [*ListAllCandidates*](#listallcandidates)
  - [*GetMemberByInfo*](#getmemberbyinfo)
  - [*GetSurvey*](#getsurvey)
- [**Mutations**](#mutations)
  - [*SubmitVote*](#submitvote)
  - [*UpdateCandidateVote*](#updatecandidatevote)
  - [*CreateVoter*](#createvoter)
  - [*UpdateVoter*](#updatevoter)
  - [*DeleteVoter*](#deletevoter)
  - [*CreateCandidate*](#createcandidate)
  - [*UpdateCandidate*](#updatecandidate)
  - [*DeleteCandidate*](#deletecandidate)
  - [*DeleteCandidatesByRound*](#deletecandidatesbyround)
  - [*UpdateElectionSettings*](#updateelectionsettings)
  - [*CreateAdminLog*](#createadminlog)
  - [*CreateAuditLog*](#createauditlog)
  - [*CreateElection*](#createelection)
  - [*UpdateActiveElection*](#updateactiveelection)
  - [*DeleteAllCandidates*](#deleteallcandidates)
  - [*DeleteAllVoters*](#deleteallvoters)
  - [*CreateMember*](#createmember)
  - [*UpdateSystemService*](#updatesystemservice)
  - [*CreateSurvey*](#createsurvey)
  - [*SubmitSurveyResponse*](#submitsurveyresponse)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `vote`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@vote/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@vote/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@vote/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `vote` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetSystemSetting
You can execute the `GetSystemSetting` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getSystemSetting(vars: GetSystemSettingVariables): QueryPromise<GetSystemSettingData, GetSystemSettingVariables>;

interface GetSystemSettingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSystemSettingVariables): QueryRef<GetSystemSettingData, GetSystemSettingVariables>;
}
export const getSystemSettingRef: GetSystemSettingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSystemSetting(dc: DataConnect, vars: GetSystemSettingVariables): QueryPromise<GetSystemSettingData, GetSystemSettingVariables>;

interface GetSystemSettingRef {
  ...
  (dc: DataConnect, vars: GetSystemSettingVariables): QueryRef<GetSystemSettingData, GetSystemSettingVariables>;
}
export const getSystemSettingRef: GetSystemSettingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSystemSettingRef:
```typescript
const name = getSystemSettingRef.operationName;
console.log(name);
```

### Variables
The `GetSystemSetting` query requires an argument of type `GetSystemSettingVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSystemSettingVariables {
  id: string;
}
```
### Return Type
Recall that executing the `GetSystemSetting` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSystemSettingData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetSystemSetting`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSystemSetting, GetSystemSettingVariables } from '@vote/dataconnect';

// The `GetSystemSetting` query requires an argument of type `GetSystemSettingVariables`:
const getSystemSettingVars: GetSystemSettingVariables = {
  id: ..., 
};

// Call the `getSystemSetting()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSystemSetting(getSystemSettingVars);
// Variables can be defined inline as well.
const { data } = await getSystemSetting({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSystemSetting(dataConnect, getSystemSettingVars);

console.log(data.systemSetting);

// Or, you can use the `Promise` API.
getSystemSetting(getSystemSettingVars).then((response) => {
  const data = response.data;
  console.log(data.systemSetting);
});
```

### Using `GetSystemSetting`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSystemSettingRef, GetSystemSettingVariables } from '@vote/dataconnect';

// The `GetSystemSetting` query requires an argument of type `GetSystemSettingVariables`:
const getSystemSettingVars: GetSystemSettingVariables = {
  id: ..., 
};

// Call the `getSystemSettingRef()` function to get a reference to the query.
const ref = getSystemSettingRef(getSystemSettingVars);
// Variables can be defined inline as well.
const ref = getSystemSettingRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSystemSettingRef(dataConnect, getSystemSettingVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.systemSetting);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.systemSetting);
});
```

## GetVoterByInfo
You can execute the `GetVoterByInfo` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getVoterByInfo(vars: GetVoterByInfoVariables): QueryPromise<GetVoterByInfoData, GetVoterByInfoVariables>;

interface GetVoterByInfoRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVoterByInfoVariables): QueryRef<GetVoterByInfoData, GetVoterByInfoVariables>;
}
export const getVoterByInfoRef: GetVoterByInfoRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getVoterByInfo(dc: DataConnect, vars: GetVoterByInfoVariables): QueryPromise<GetVoterByInfoData, GetVoterByInfoVariables>;

interface GetVoterByInfoRef {
  ...
  (dc: DataConnect, vars: GetVoterByInfoVariables): QueryRef<GetVoterByInfoData, GetVoterByInfoVariables>;
}
export const getVoterByInfoRef: GetVoterByInfoRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getVoterByInfoRef:
```typescript
const name = getVoterByInfoRef.operationName;
console.log(name);
```

### Variables
The `GetVoterByInfo` query requires an argument of type `GetVoterByInfoVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetVoterByInfoVariables {
  electionId: string;
  phone: string;
  birthdate: string;
}
```
### Return Type
Recall that executing the `GetVoterByInfo` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetVoterByInfoData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetVoterByInfoData {
  voters: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
  } & Voter_Key)[];
}
```
### Using `GetVoterByInfo`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getVoterByInfo, GetVoterByInfoVariables } from '@vote/dataconnect';

// The `GetVoterByInfo` query requires an argument of type `GetVoterByInfoVariables`:
const getVoterByInfoVars: GetVoterByInfoVariables = {
  electionId: ..., 
  phone: ..., 
  birthdate: ..., 
};

// Call the `getVoterByInfo()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getVoterByInfo(getVoterByInfoVars);
// Variables can be defined inline as well.
const { data } = await getVoterByInfo({ electionId: ..., phone: ..., birthdate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getVoterByInfo(dataConnect, getVoterByInfoVars);

console.log(data.voters);

// Or, you can use the `Promise` API.
getVoterByInfo(getVoterByInfoVars).then((response) => {
  const data = response.data;
  console.log(data.voters);
});
```

### Using `GetVoterByInfo`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getVoterByInfoRef, GetVoterByInfoVariables } from '@vote/dataconnect';

// The `GetVoterByInfo` query requires an argument of type `GetVoterByInfoVariables`:
const getVoterByInfoVars: GetVoterByInfoVariables = {
  electionId: ..., 
  phone: ..., 
  birthdate: ..., 
};

// Call the `getVoterByInfoRef()` function to get a reference to the query.
const ref = getVoterByInfoRef(getVoterByInfoVars);
// Variables can be defined inline as well.
const ref = getVoterByInfoRef({ electionId: ..., phone: ..., birthdate: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getVoterByInfoRef(dataConnect, getVoterByInfoVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.voters);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.voters);
});
```

## GetElectionSettings
You can execute the `GetElectionSettings` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getElectionSettings(vars: GetElectionSettingsVariables): QueryPromise<GetElectionSettingsData, GetElectionSettingsVariables>;

interface GetElectionSettingsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetElectionSettingsVariables): QueryRef<GetElectionSettingsData, GetElectionSettingsVariables>;
}
export const getElectionSettingsRef: GetElectionSettingsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getElectionSettings(dc: DataConnect, vars: GetElectionSettingsVariables): QueryPromise<GetElectionSettingsData, GetElectionSettingsVariables>;

interface GetElectionSettingsRef {
  ...
  (dc: DataConnect, vars: GetElectionSettingsVariables): QueryRef<GetElectionSettingsData, GetElectionSettingsVariables>;
}
export const getElectionSettingsRef: GetElectionSettingsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getElectionSettingsRef:
```typescript
const name = getElectionSettingsRef.operationName;
console.log(name);
```

### Variables
The `GetElectionSettings` query requires an argument of type `GetElectionSettingsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetElectionSettingsVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `GetElectionSettings` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetElectionSettingsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetElectionSettings`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getElectionSettings, GetElectionSettingsVariables } from '@vote/dataconnect';

// The `GetElectionSettings` query requires an argument of type `GetElectionSettingsVariables`:
const getElectionSettingsVars: GetElectionSettingsVariables = {
  electionId: ..., 
};

// Call the `getElectionSettings()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getElectionSettings(getElectionSettingsVars);
// Variables can be defined inline as well.
const { data } = await getElectionSettings({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getElectionSettings(dataConnect, getElectionSettingsVars);

console.log(data.election);

// Or, you can use the `Promise` API.
getElectionSettings(getElectionSettingsVars).then((response) => {
  const data = response.data;
  console.log(data.election);
});
```

### Using `GetElectionSettings`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getElectionSettingsRef, GetElectionSettingsVariables } from '@vote/dataconnect';

// The `GetElectionSettings` query requires an argument of type `GetElectionSettingsVariables`:
const getElectionSettingsVars: GetElectionSettingsVariables = {
  electionId: ..., 
};

// Call the `getElectionSettingsRef()` function to get a reference to the query.
const ref = getElectionSettingsRef(getElectionSettingsVars);
// Variables can be defined inline as well.
const ref = getElectionSettingsRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getElectionSettingsRef(dataConnect, getElectionSettingsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.election);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.election);
});
```

## ListCandidatesByPosition
You can execute the `ListCandidatesByPosition` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listCandidatesByPosition(vars: ListCandidatesByPositionVariables): QueryPromise<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;

interface ListCandidatesByPositionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCandidatesByPositionVariables): QueryRef<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;
}
export const listCandidatesByPositionRef: ListCandidatesByPositionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCandidatesByPosition(dc: DataConnect, vars: ListCandidatesByPositionVariables): QueryPromise<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;

interface ListCandidatesByPositionRef {
  ...
  (dc: DataConnect, vars: ListCandidatesByPositionVariables): QueryRef<ListCandidatesByPositionData, ListCandidatesByPositionVariables>;
}
export const listCandidatesByPositionRef: ListCandidatesByPositionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCandidatesByPositionRef:
```typescript
const name = listCandidatesByPositionRef.operationName;
console.log(name);
```

### Variables
The `ListCandidatesByPosition` query requires an argument of type `ListCandidatesByPositionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListCandidatesByPositionVariables {
  electionId: string;
  position: string;
}
```
### Return Type
Recall that executing the `ListCandidatesByPosition` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCandidatesByPositionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListCandidatesByPosition`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCandidatesByPosition, ListCandidatesByPositionVariables } from '@vote/dataconnect';

// The `ListCandidatesByPosition` query requires an argument of type `ListCandidatesByPositionVariables`:
const listCandidatesByPositionVars: ListCandidatesByPositionVariables = {
  electionId: ..., 
  position: ..., 
};

// Call the `listCandidatesByPosition()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCandidatesByPosition(listCandidatesByPositionVars);
// Variables can be defined inline as well.
const { data } = await listCandidatesByPosition({ electionId: ..., position: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCandidatesByPosition(dataConnect, listCandidatesByPositionVars);

console.log(data.candidates);

// Or, you can use the `Promise` API.
listCandidatesByPosition(listCandidatesByPositionVars).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

### Using `ListCandidatesByPosition`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCandidatesByPositionRef, ListCandidatesByPositionVariables } from '@vote/dataconnect';

// The `ListCandidatesByPosition` query requires an argument of type `ListCandidatesByPositionVariables`:
const listCandidatesByPositionVars: ListCandidatesByPositionVariables = {
  electionId: ..., 
  position: ..., 
};

// Call the `listCandidatesByPositionRef()` function to get a reference to the query.
const ref = listCandidatesByPositionRef(listCandidatesByPositionVars);
// Variables can be defined inline as well.
const ref = listCandidatesByPositionRef({ electionId: ..., position: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCandidatesByPositionRef(dataConnect, listCandidatesByPositionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.candidates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

## ListCandidatesByRound
You can execute the `ListCandidatesByRound` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listCandidatesByRound(vars: ListCandidatesByRoundVariables): QueryPromise<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;

interface ListCandidatesByRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCandidatesByRoundVariables): QueryRef<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;
}
export const listCandidatesByRoundRef: ListCandidatesByRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCandidatesByRound(dc: DataConnect, vars: ListCandidatesByRoundVariables): QueryPromise<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;

interface ListCandidatesByRoundRef {
  ...
  (dc: DataConnect, vars: ListCandidatesByRoundVariables): QueryRef<ListCandidatesByRoundData, ListCandidatesByRoundVariables>;
}
export const listCandidatesByRoundRef: ListCandidatesByRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCandidatesByRoundRef:
```typescript
const name = listCandidatesByRoundRef.operationName;
console.log(name);
```

### Variables
The `ListCandidatesByRound` query requires an argument of type `ListCandidatesByRoundVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListCandidatesByRoundVariables {
  electionId: string;
  position: string;
  round: number;
}
```
### Return Type
Recall that executing the `ListCandidatesByRound` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCandidatesByRoundData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListCandidatesByRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCandidatesByRound, ListCandidatesByRoundVariables } from '@vote/dataconnect';

// The `ListCandidatesByRound` query requires an argument of type `ListCandidatesByRoundVariables`:
const listCandidatesByRoundVars: ListCandidatesByRoundVariables = {
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `listCandidatesByRound()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCandidatesByRound(listCandidatesByRoundVars);
// Variables can be defined inline as well.
const { data } = await listCandidatesByRound({ electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCandidatesByRound(dataConnect, listCandidatesByRoundVars);

console.log(data.candidates);

// Or, you can use the `Promise` API.
listCandidatesByRound(listCandidatesByRoundVars).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

### Using `ListCandidatesByRound`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCandidatesByRoundRef, ListCandidatesByRoundVariables } from '@vote/dataconnect';

// The `ListCandidatesByRound` query requires an argument of type `ListCandidatesByRoundVariables`:
const listCandidatesByRoundVars: ListCandidatesByRoundVariables = {
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `listCandidatesByRoundRef()` function to get a reference to the query.
const ref = listCandidatesByRoundRef(listCandidatesByRoundVars);
// Variables can be defined inline as well.
const ref = listCandidatesByRoundRef({ electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCandidatesByRoundRef(dataConnect, listCandidatesByRoundVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.candidates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

## ListVoters
You can execute the `ListVoters` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listVoters(vars: ListVotersVariables): QueryPromise<ListVotersData, ListVotersVariables>;

interface ListVotersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListVotersVariables): QueryRef<ListVotersData, ListVotersVariables>;
}
export const listVotersRef: ListVotersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVoters(dc: DataConnect, vars: ListVotersVariables): QueryPromise<ListVotersData, ListVotersVariables>;

interface ListVotersRef {
  ...
  (dc: DataConnect, vars: ListVotersVariables): QueryRef<ListVotersData, ListVotersVariables>;
}
export const listVotersRef: ListVotersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVotersRef:
```typescript
const name = listVotersRef.operationName;
console.log(name);
```

### Variables
The `ListVoters` query requires an argument of type `ListVotersVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListVotersVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `ListVoters` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVotersData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVotersData {
  voters: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
    authKey: string;
  } & Voter_Key)[];
}
```
### Using `ListVoters`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVoters, ListVotersVariables } from '@vote/dataconnect';

// The `ListVoters` query requires an argument of type `ListVotersVariables`:
const listVotersVars: ListVotersVariables = {
  electionId: ..., 
};

// Call the `listVoters()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVoters(listVotersVars);
// Variables can be defined inline as well.
const { data } = await listVoters({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVoters(dataConnect, listVotersVars);

console.log(data.voters);

// Or, you can use the `Promise` API.
listVoters(listVotersVars).then((response) => {
  const data = response.data;
  console.log(data.voters);
});
```

### Using `ListVoters`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVotersRef, ListVotersVariables } from '@vote/dataconnect';

// The `ListVoters` query requires an argument of type `ListVotersVariables`:
const listVotersVars: ListVotersVariables = {
  electionId: ..., 
};

// Call the `listVotersRef()` function to get a reference to the query.
const ref = listVotersRef(listVotersVars);
// Variables can be defined inline as well.
const ref = listVotersRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVotersRef(dataConnect, listVotersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.voters);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.voters);
});
```

## ListVoterParticipations
You can execute the `ListVoterParticipations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listVoterParticipations(vars: ListVoterParticipationsVariables): QueryPromise<ListVoterParticipationsData, ListVoterParticipationsVariables>;

interface ListVoterParticipationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListVoterParticipationsVariables): QueryRef<ListVoterParticipationsData, ListVoterParticipationsVariables>;
}
export const listVoterParticipationsRef: ListVoterParticipationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVoterParticipations(dc: DataConnect, vars: ListVoterParticipationsVariables): QueryPromise<ListVoterParticipationsData, ListVoterParticipationsVariables>;

interface ListVoterParticipationsRef {
  ...
  (dc: DataConnect, vars: ListVoterParticipationsVariables): QueryRef<ListVoterParticipationsData, ListVoterParticipationsVariables>;
}
export const listVoterParticipationsRef: ListVoterParticipationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVoterParticipationsRef:
```typescript
const name = listVoterParticipationsRef.operationName;
console.log(name);
```

### Variables
The `ListVoterParticipations` query requires an argument of type `ListVoterParticipationsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListVoterParticipationsVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `ListVoterParticipations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVoterParticipationsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVoterParticipationsData {
  voterParticipations: ({
    voterId: UUIDString;
    position: string;
    roundNumber: number;
    votedAt: TimestampString;
  })[];
}
```
### Using `ListVoterParticipations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVoterParticipations, ListVoterParticipationsVariables } from '@vote/dataconnect';

// The `ListVoterParticipations` query requires an argument of type `ListVoterParticipationsVariables`:
const listVoterParticipationsVars: ListVoterParticipationsVariables = {
  electionId: ..., 
};

// Call the `listVoterParticipations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVoterParticipations(listVoterParticipationsVars);
// Variables can be defined inline as well.
const { data } = await listVoterParticipations({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVoterParticipations(dataConnect, listVoterParticipationsVars);

console.log(data.voterParticipations);

// Or, you can use the `Promise` API.
listVoterParticipations(listVoterParticipationsVars).then((response) => {
  const data = response.data;
  console.log(data.voterParticipations);
});
```

### Using `ListVoterParticipations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVoterParticipationsRef, ListVoterParticipationsVariables } from '@vote/dataconnect';

// The `ListVoterParticipations` query requires an argument of type `ListVoterParticipationsVariables`:
const listVoterParticipationsVars: ListVoterParticipationsVariables = {
  electionId: ..., 
};

// Call the `listVoterParticipationsRef()` function to get a reference to the query.
const ref = listVoterParticipationsRef(listVoterParticipationsVars);
// Variables can be defined inline as well.
const ref = listVoterParticipationsRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVoterParticipationsRef(dataConnect, listVoterParticipationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.voterParticipations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.voterParticipations);
});
```

## ListElections
You can execute the `ListElections` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listElections(): QueryPromise<ListElectionsData, undefined>;

interface ListElectionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListElectionsData, undefined>;
}
export const listElectionsRef: ListElectionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listElections(dc: DataConnect): QueryPromise<ListElectionsData, undefined>;

interface ListElectionsRef {
  ...
  (dc: DataConnect): QueryRef<ListElectionsData, undefined>;
}
export const listElectionsRef: ListElectionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listElectionsRef:
```typescript
const name = listElectionsRef.operationName;
console.log(name);
```

### Variables
The `ListElections` query has no variables.
### Return Type
Recall that executing the `ListElections` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListElectionsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListElectionsData {
  elections: ({
    id: string;
    name?: string | null;
    rounds?: string | null;
  } & Election_Key)[];
}
```
### Using `ListElections`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listElections } from '@vote/dataconnect';


// Call the `listElections()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listElections();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listElections(dataConnect);

console.log(data.elections);

// Or, you can use the `Promise` API.
listElections().then((response) => {
  const data = response.data;
  console.log(data.elections);
});
```

### Using `ListElections`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listElectionsRef } from '@vote/dataconnect';


// Call the `listElectionsRef()` function to get a reference to the query.
const ref = listElectionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listElectionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.elections);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.elections);
});
```

## GetResultsByRound
You can execute the `GetResultsByRound` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getResultsByRound(vars: GetResultsByRoundVariables): QueryPromise<GetResultsByRoundData, GetResultsByRoundVariables>;

interface GetResultsByRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetResultsByRoundVariables): QueryRef<GetResultsByRoundData, GetResultsByRoundVariables>;
}
export const getResultsByRoundRef: GetResultsByRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getResultsByRound(dc: DataConnect, vars: GetResultsByRoundVariables): QueryPromise<GetResultsByRoundData, GetResultsByRoundVariables>;

interface GetResultsByRoundRef {
  ...
  (dc: DataConnect, vars: GetResultsByRoundVariables): QueryRef<GetResultsByRoundData, GetResultsByRoundVariables>;
}
export const getResultsByRoundRef: GetResultsByRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getResultsByRoundRef:
```typescript
const name = getResultsByRoundRef.operationName;
console.log(name);
```

### Variables
The `GetResultsByRound` query requires an argument of type `GetResultsByRoundVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetResultsByRoundVariables {
  electionId: string;
  position: string;
  round: number;
}
```
### Return Type
Recall that executing the `GetResultsByRound` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetResultsByRoundData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetResultsByRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getResultsByRound, GetResultsByRoundVariables } from '@vote/dataconnect';

// The `GetResultsByRound` query requires an argument of type `GetResultsByRoundVariables`:
const getResultsByRoundVars: GetResultsByRoundVariables = {
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `getResultsByRound()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getResultsByRound(getResultsByRoundVars);
// Variables can be defined inline as well.
const { data } = await getResultsByRound({ electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getResultsByRound(dataConnect, getResultsByRoundVars);

console.log(data.candidates);

// Or, you can use the `Promise` API.
getResultsByRound(getResultsByRoundVars).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

### Using `GetResultsByRound`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getResultsByRoundRef, GetResultsByRoundVariables } from '@vote/dataconnect';

// The `GetResultsByRound` query requires an argument of type `GetResultsByRoundVariables`:
const getResultsByRoundVars: GetResultsByRoundVariables = {
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `getResultsByRoundRef()` function to get a reference to the query.
const ref = getResultsByRoundRef(getResultsByRoundVars);
// Variables can be defined inline as well.
const ref = getResultsByRoundRef({ electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getResultsByRoundRef(dataConnect, getResultsByRoundVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.candidates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

## ListAdminLogs
You can execute the `ListAdminLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listAdminLogs(vars: ListAdminLogsVariables): QueryPromise<ListAdminLogsData, ListAdminLogsVariables>;

interface ListAdminLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAdminLogsVariables): QueryRef<ListAdminLogsData, ListAdminLogsVariables>;
}
export const listAdminLogsRef: ListAdminLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAdminLogs(dc: DataConnect, vars: ListAdminLogsVariables): QueryPromise<ListAdminLogsData, ListAdminLogsVariables>;

interface ListAdminLogsRef {
  ...
  (dc: DataConnect, vars: ListAdminLogsVariables): QueryRef<ListAdminLogsData, ListAdminLogsVariables>;
}
export const listAdminLogsRef: ListAdminLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAdminLogsRef:
```typescript
const name = listAdminLogsRef.operationName;
console.log(name);
```

### Variables
The `ListAdminLogs` query requires an argument of type `ListAdminLogsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAdminLogsVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `ListAdminLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAdminLogsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAdminLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAdminLogs, ListAdminLogsVariables } from '@vote/dataconnect';

// The `ListAdminLogs` query requires an argument of type `ListAdminLogsVariables`:
const listAdminLogsVars: ListAdminLogsVariables = {
  electionId: ..., 
};

// Call the `listAdminLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAdminLogs(listAdminLogsVars);
// Variables can be defined inline as well.
const { data } = await listAdminLogs({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAdminLogs(dataConnect, listAdminLogsVars);

console.log(data.adminLogs);

// Or, you can use the `Promise` API.
listAdminLogs(listAdminLogsVars).then((response) => {
  const data = response.data;
  console.log(data.adminLogs);
});
```

### Using `ListAdminLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAdminLogsRef, ListAdminLogsVariables } from '@vote/dataconnect';

// The `ListAdminLogs` query requires an argument of type `ListAdminLogsVariables`:
const listAdminLogsVars: ListAdminLogsVariables = {
  electionId: ..., 
};

// Call the `listAdminLogsRef()` function to get a reference to the query.
const ref = listAdminLogsRef(listAdminLogsVars);
// Variables can be defined inline as well.
const ref = listAdminLogsRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAdminLogsRef(dataConnect, listAdminLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.adminLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.adminLogs);
});
```

## ListAuditLogs
You can execute the `ListAuditLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listAuditLogs(vars: ListAuditLogsVariables): QueryPromise<ListAuditLogsData, ListAuditLogsVariables>;

interface ListAuditLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAuditLogsVariables): QueryRef<ListAuditLogsData, ListAuditLogsVariables>;
}
export const listAuditLogsRef: ListAuditLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAuditLogs(dc: DataConnect, vars: ListAuditLogsVariables): QueryPromise<ListAuditLogsData, ListAuditLogsVariables>;

interface ListAuditLogsRef {
  ...
  (dc: DataConnect, vars: ListAuditLogsVariables): QueryRef<ListAuditLogsData, ListAuditLogsVariables>;
}
export const listAuditLogsRef: ListAuditLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAuditLogsRef:
```typescript
const name = listAuditLogsRef.operationName;
console.log(name);
```

### Variables
The `ListAuditLogs` query requires an argument of type `ListAuditLogsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAuditLogsVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `ListAuditLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAuditLogsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAuditLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAuditLogs, ListAuditLogsVariables } from '@vote/dataconnect';

// The `ListAuditLogs` query requires an argument of type `ListAuditLogsVariables`:
const listAuditLogsVars: ListAuditLogsVariables = {
  electionId: ..., 
};

// Call the `listAuditLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAuditLogs(listAuditLogsVars);
// Variables can be defined inline as well.
const { data } = await listAuditLogs({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAuditLogs(dataConnect, listAuditLogsVars);

console.log(data.auditLogs);

// Or, you can use the `Promise` API.
listAuditLogs(listAuditLogsVars).then((response) => {
  const data = response.data;
  console.log(data.auditLogs);
});
```

### Using `ListAuditLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAuditLogsRef, ListAuditLogsVariables } from '@vote/dataconnect';

// The `ListAuditLogs` query requires an argument of type `ListAuditLogsVariables`:
const listAuditLogsVars: ListAuditLogsVariables = {
  electionId: ..., 
};

// Call the `listAuditLogsRef()` function to get a reference to the query.
const ref = listAuditLogsRef(listAuditLogsVars);
// Variables can be defined inline as well.
const ref = listAuditLogsRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAuditLogsRef(dataConnect, listAuditLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.auditLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLogs);
});
```

## ListAllCandidates
You can execute the `ListAllCandidates` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listAllCandidates(vars: ListAllCandidatesVariables): QueryPromise<ListAllCandidatesData, ListAllCandidatesVariables>;

interface ListAllCandidatesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAllCandidatesVariables): QueryRef<ListAllCandidatesData, ListAllCandidatesVariables>;
}
export const listAllCandidatesRef: ListAllCandidatesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllCandidates(dc: DataConnect, vars: ListAllCandidatesVariables): QueryPromise<ListAllCandidatesData, ListAllCandidatesVariables>;

interface ListAllCandidatesRef {
  ...
  (dc: DataConnect, vars: ListAllCandidatesVariables): QueryRef<ListAllCandidatesData, ListAllCandidatesVariables>;
}
export const listAllCandidatesRef: ListAllCandidatesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllCandidatesRef:
```typescript
const name = listAllCandidatesRef.operationName;
console.log(name);
```

### Variables
The `ListAllCandidates` query requires an argument of type `ListAllCandidatesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAllCandidatesVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `ListAllCandidates` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllCandidatesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAllCandidates`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllCandidates, ListAllCandidatesVariables } from '@vote/dataconnect';

// The `ListAllCandidates` query requires an argument of type `ListAllCandidatesVariables`:
const listAllCandidatesVars: ListAllCandidatesVariables = {
  electionId: ..., 
};

// Call the `listAllCandidates()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllCandidates(listAllCandidatesVars);
// Variables can be defined inline as well.
const { data } = await listAllCandidates({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllCandidates(dataConnect, listAllCandidatesVars);

console.log(data.candidates);

// Or, you can use the `Promise` API.
listAllCandidates(listAllCandidatesVars).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

### Using `ListAllCandidates`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllCandidatesRef, ListAllCandidatesVariables } from '@vote/dataconnect';

// The `ListAllCandidates` query requires an argument of type `ListAllCandidatesVariables`:
const listAllCandidatesVars: ListAllCandidatesVariables = {
  electionId: ..., 
};

// Call the `listAllCandidatesRef()` function to get a reference to the query.
const ref = listAllCandidatesRef(listAllCandidatesVars);
// Variables can be defined inline as well.
const ref = listAllCandidatesRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllCandidatesRef(dataConnect, listAllCandidatesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.candidates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.candidates);
});
```

## GetMemberByInfo
You can execute the `GetMemberByInfo` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMemberByInfo(vars: GetMemberByInfoVariables): QueryPromise<GetMemberByInfoData, GetMemberByInfoVariables>;

interface GetMemberByInfoRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMemberByInfoVariables): QueryRef<GetMemberByInfoData, GetMemberByInfoVariables>;
}
export const getMemberByInfoRef: GetMemberByInfoRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMemberByInfo(dc: DataConnect, vars: GetMemberByInfoVariables): QueryPromise<GetMemberByInfoData, GetMemberByInfoVariables>;

interface GetMemberByInfoRef {
  ...
  (dc: DataConnect, vars: GetMemberByInfoVariables): QueryRef<GetMemberByInfoData, GetMemberByInfoVariables>;
}
export const getMemberByInfoRef: GetMemberByInfoRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMemberByInfoRef:
```typescript
const name = getMemberByInfoRef.operationName;
console.log(name);
```

### Variables
The `GetMemberByInfo` query requires an argument of type `GetMemberByInfoVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMemberByInfoVariables {
  phone: string;
  birthdate: string;
}
```
### Return Type
Recall that executing the `GetMemberByInfo` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMemberByInfoData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMemberByInfoData {
  members: ({
    id: UUIDString;
    name: string;
    phone?: string | null;
    birthdate?: string | null;
  } & Member_Key)[];
}
```
### Using `GetMemberByInfo`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMemberByInfo, GetMemberByInfoVariables } from '@vote/dataconnect';

// The `GetMemberByInfo` query requires an argument of type `GetMemberByInfoVariables`:
const getMemberByInfoVars: GetMemberByInfoVariables = {
  phone: ..., 
  birthdate: ..., 
};

// Call the `getMemberByInfo()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMemberByInfo(getMemberByInfoVars);
// Variables can be defined inline as well.
const { data } = await getMemberByInfo({ phone: ..., birthdate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMemberByInfo(dataConnect, getMemberByInfoVars);

console.log(data.members);

// Or, you can use the `Promise` API.
getMemberByInfo(getMemberByInfoVars).then((response) => {
  const data = response.data;
  console.log(data.members);
});
```

### Using `GetMemberByInfo`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMemberByInfoRef, GetMemberByInfoVariables } from '@vote/dataconnect';

// The `GetMemberByInfo` query requires an argument of type `GetMemberByInfoVariables`:
const getMemberByInfoVars: GetMemberByInfoVariables = {
  phone: ..., 
  birthdate: ..., 
};

// Call the `getMemberByInfoRef()` function to get a reference to the query.
const ref = getMemberByInfoRef(getMemberByInfoVars);
// Variables can be defined inline as well.
const ref = getMemberByInfoRef({ phone: ..., birthdate: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMemberByInfoRef(dataConnect, getMemberByInfoVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.members);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.members);
});
```

## GetSurvey
You can execute the `GetSurvey` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getSurvey(vars: GetSurveyVariables): QueryPromise<GetSurveyData, GetSurveyVariables>;

interface GetSurveyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSurveyVariables): QueryRef<GetSurveyData, GetSurveyVariables>;
}
export const getSurveyRef: GetSurveyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSurvey(dc: DataConnect, vars: GetSurveyVariables): QueryPromise<GetSurveyData, GetSurveyVariables>;

interface GetSurveyRef {
  ...
  (dc: DataConnect, vars: GetSurveyVariables): QueryRef<GetSurveyData, GetSurveyVariables>;
}
export const getSurveyRef: GetSurveyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSurveyRef:
```typescript
const name = getSurveyRef.operationName;
console.log(name);
```

### Variables
The `GetSurvey` query requires an argument of type `GetSurveyVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSurveyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetSurvey` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSurveyData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetSurvey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSurvey, GetSurveyVariables } from '@vote/dataconnect';

// The `GetSurvey` query requires an argument of type `GetSurveyVariables`:
const getSurveyVars: GetSurveyVariables = {
  id: ..., 
};

// Call the `getSurvey()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSurvey(getSurveyVars);
// Variables can be defined inline as well.
const { data } = await getSurvey({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSurvey(dataConnect, getSurveyVars);

console.log(data.survey);

// Or, you can use the `Promise` API.
getSurvey(getSurveyVars).then((response) => {
  const data = response.data;
  console.log(data.survey);
});
```

### Using `GetSurvey`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSurveyRef, GetSurveyVariables } from '@vote/dataconnect';

// The `GetSurvey` query requires an argument of type `GetSurveyVariables`:
const getSurveyVars: GetSurveyVariables = {
  id: ..., 
};

// Call the `getSurveyRef()` function to get a reference to the query.
const ref = getSurveyRef(getSurveyVars);
// Variables can be defined inline as well.
const ref = getSurveyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSurveyRef(dataConnect, getSurveyVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.survey);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.survey);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `vote` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## SubmitVote
You can execute the `SubmitVote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
submitVote(vars: SubmitVoteVariables): MutationPromise<SubmitVoteData, SubmitVoteVariables>;

interface SubmitVoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitVoteVariables): MutationRef<SubmitVoteData, SubmitVoteVariables>;
}
export const submitVoteRef: SubmitVoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
submitVote(dc: DataConnect, vars: SubmitVoteVariables): MutationPromise<SubmitVoteData, SubmitVoteVariables>;

interface SubmitVoteRef {
  ...
  (dc: DataConnect, vars: SubmitVoteVariables): MutationRef<SubmitVoteData, SubmitVoteVariables>;
}
export const submitVoteRef: SubmitVoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the submitVoteRef:
```typescript
const name = submitVoteRef.operationName;
console.log(name);
```

### Variables
The `SubmitVote` mutation requires an argument of type `SubmitVoteVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SubmitVoteVariables {
  voterId: UUIDString;
  electionId: string;
  position: string;
  round: number;
}
```
### Return Type
Recall that executing the `SubmitVote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SubmitVoteData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SubmitVoteData {
  voterParticipation_insert: VoterParticipation_Key;
}
```
### Using `SubmitVote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, submitVote, SubmitVoteVariables } from '@vote/dataconnect';

// The `SubmitVote` mutation requires an argument of type `SubmitVoteVariables`:
const submitVoteVars: SubmitVoteVariables = {
  voterId: ..., 
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `submitVote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await submitVote(submitVoteVars);
// Variables can be defined inline as well.
const { data } = await submitVote({ voterId: ..., electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await submitVote(dataConnect, submitVoteVars);

console.log(data.voterParticipation_insert);

// Or, you can use the `Promise` API.
submitVote(submitVoteVars).then((response) => {
  const data = response.data;
  console.log(data.voterParticipation_insert);
});
```

### Using `SubmitVote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, submitVoteRef, SubmitVoteVariables } from '@vote/dataconnect';

// The `SubmitVote` mutation requires an argument of type `SubmitVoteVariables`:
const submitVoteVars: SubmitVoteVariables = {
  voterId: ..., 
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `submitVoteRef()` function to get a reference to the mutation.
const ref = submitVoteRef(submitVoteVars);
// Variables can be defined inline as well.
const ref = submitVoteRef({ voterId: ..., electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = submitVoteRef(dataConnect, submitVoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.voterParticipation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.voterParticipation_insert);
});
```

## UpdateCandidateVote
You can execute the `UpdateCandidateVote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateCandidateVote(vars: UpdateCandidateVoteVariables): MutationPromise<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;

interface UpdateCandidateVoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCandidateVoteVariables): MutationRef<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;
}
export const updateCandidateVoteRef: UpdateCandidateVoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCandidateVote(dc: DataConnect, vars: UpdateCandidateVoteVariables): MutationPromise<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;

interface UpdateCandidateVoteRef {
  ...
  (dc: DataConnect, vars: UpdateCandidateVoteVariables): MutationRef<UpdateCandidateVoteData, UpdateCandidateVoteVariables>;
}
export const updateCandidateVoteRef: UpdateCandidateVoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCandidateVoteRef:
```typescript
const name = updateCandidateVoteRef.operationName;
console.log(name);
```

### Variables
The `UpdateCandidateVote` mutation requires an argument of type `UpdateCandidateVoteVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCandidateVoteVariables {
  candidateId: UUIDString;
  newCount: number;
}
```
### Return Type
Recall that executing the `UpdateCandidateVote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCandidateVoteData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCandidateVoteData {
  candidate_update?: Candidate_Key | null;
}
```
### Using `UpdateCandidateVote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCandidateVote, UpdateCandidateVoteVariables } from '@vote/dataconnect';

// The `UpdateCandidateVote` mutation requires an argument of type `UpdateCandidateVoteVariables`:
const updateCandidateVoteVars: UpdateCandidateVoteVariables = {
  candidateId: ..., 
  newCount: ..., 
};

// Call the `updateCandidateVote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCandidateVote(updateCandidateVoteVars);
// Variables can be defined inline as well.
const { data } = await updateCandidateVote({ candidateId: ..., newCount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCandidateVote(dataConnect, updateCandidateVoteVars);

console.log(data.candidate_update);

// Or, you can use the `Promise` API.
updateCandidateVote(updateCandidateVoteVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_update);
});
```

### Using `UpdateCandidateVote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCandidateVoteRef, UpdateCandidateVoteVariables } from '@vote/dataconnect';

// The `UpdateCandidateVote` mutation requires an argument of type `UpdateCandidateVoteVariables`:
const updateCandidateVoteVars: UpdateCandidateVoteVariables = {
  candidateId: ..., 
  newCount: ..., 
};

// Call the `updateCandidateVoteRef()` function to get a reference to the mutation.
const ref = updateCandidateVoteRef(updateCandidateVoteVars);
// Variables can be defined inline as well.
const ref = updateCandidateVoteRef({ candidateId: ..., newCount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCandidateVoteRef(dataConnect, updateCandidateVoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_update);
});
```

## CreateVoter
You can execute the `CreateVoter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createVoter(vars: CreateVoterVariables): MutationPromise<CreateVoterData, CreateVoterVariables>;

interface CreateVoterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVoterVariables): MutationRef<CreateVoterData, CreateVoterVariables>;
}
export const createVoterRef: CreateVoterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createVoter(dc: DataConnect, vars: CreateVoterVariables): MutationPromise<CreateVoterData, CreateVoterVariables>;

interface CreateVoterRef {
  ...
  (dc: DataConnect, vars: CreateVoterVariables): MutationRef<CreateVoterData, CreateVoterVariables>;
}
export const createVoterRef: CreateVoterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createVoterRef:
```typescript
const name = createVoterRef.operationName;
console.log(name);
```

### Variables
The `CreateVoter` mutation requires an argument of type `CreateVoterVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateVoterVariables {
  electionId: string;
  name: string;
  phone?: string | null;
  birthdate?: string | null;
  authKey: string;
}
```
### Return Type
Recall that executing the `CreateVoter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateVoterData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateVoterData {
  voter_insert: Voter_Key;
}
```
### Using `CreateVoter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createVoter, CreateVoterVariables } from '@vote/dataconnect';

// The `CreateVoter` mutation requires an argument of type `CreateVoterVariables`:
const createVoterVars: CreateVoterVariables = {
  electionId: ..., 
  name: ..., 
  phone: ..., // optional
  birthdate: ..., // optional
  authKey: ..., 
};

// Call the `createVoter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createVoter(createVoterVars);
// Variables can be defined inline as well.
const { data } = await createVoter({ electionId: ..., name: ..., phone: ..., birthdate: ..., authKey: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createVoter(dataConnect, createVoterVars);

console.log(data.voter_insert);

// Or, you can use the `Promise` API.
createVoter(createVoterVars).then((response) => {
  const data = response.data;
  console.log(data.voter_insert);
});
```

### Using `CreateVoter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createVoterRef, CreateVoterVariables } from '@vote/dataconnect';

// The `CreateVoter` mutation requires an argument of type `CreateVoterVariables`:
const createVoterVars: CreateVoterVariables = {
  electionId: ..., 
  name: ..., 
  phone: ..., // optional
  birthdate: ..., // optional
  authKey: ..., 
};

// Call the `createVoterRef()` function to get a reference to the mutation.
const ref = createVoterRef(createVoterVars);
// Variables can be defined inline as well.
const ref = createVoterRef({ electionId: ..., name: ..., phone: ..., birthdate: ..., authKey: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createVoterRef(dataConnect, createVoterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.voter_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.voter_insert);
});
```

## UpdateVoter
You can execute the `UpdateVoter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateVoter(vars: UpdateVoterVariables): MutationPromise<UpdateVoterData, UpdateVoterVariables>;

interface UpdateVoterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVoterVariables): MutationRef<UpdateVoterData, UpdateVoterVariables>;
}
export const updateVoterRef: UpdateVoterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateVoter(dc: DataConnect, vars: UpdateVoterVariables): MutationPromise<UpdateVoterData, UpdateVoterVariables>;

interface UpdateVoterRef {
  ...
  (dc: DataConnect, vars: UpdateVoterVariables): MutationRef<UpdateVoterData, UpdateVoterVariables>;
}
export const updateVoterRef: UpdateVoterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateVoterRef:
```typescript
const name = updateVoterRef.operationName;
console.log(name);
```

### Variables
The `UpdateVoter` mutation requires an argument of type `UpdateVoterVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateVoterVariables {
  id: UUIDString;
  name: string;
  phone?: string | null;
  birthdate?: string | null;
}
```
### Return Type
Recall that executing the `UpdateVoter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateVoterData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateVoterData {
  voter_update?: Voter_Key | null;
}
```
### Using `UpdateVoter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateVoter, UpdateVoterVariables } from '@vote/dataconnect';

// The `UpdateVoter` mutation requires an argument of type `UpdateVoterVariables`:
const updateVoterVars: UpdateVoterVariables = {
  id: ..., 
  name: ..., 
  phone: ..., // optional
  birthdate: ..., // optional
};

// Call the `updateVoter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateVoter(updateVoterVars);
// Variables can be defined inline as well.
const { data } = await updateVoter({ id: ..., name: ..., phone: ..., birthdate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateVoter(dataConnect, updateVoterVars);

console.log(data.voter_update);

// Or, you can use the `Promise` API.
updateVoter(updateVoterVars).then((response) => {
  const data = response.data;
  console.log(data.voter_update);
});
```

### Using `UpdateVoter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateVoterRef, UpdateVoterVariables } from '@vote/dataconnect';

// The `UpdateVoter` mutation requires an argument of type `UpdateVoterVariables`:
const updateVoterVars: UpdateVoterVariables = {
  id: ..., 
  name: ..., 
  phone: ..., // optional
  birthdate: ..., // optional
};

// Call the `updateVoterRef()` function to get a reference to the mutation.
const ref = updateVoterRef(updateVoterVars);
// Variables can be defined inline as well.
const ref = updateVoterRef({ id: ..., name: ..., phone: ..., birthdate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateVoterRef(dataConnect, updateVoterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.voter_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.voter_update);
});
```

## DeleteVoter
You can execute the `DeleteVoter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteVoter(vars: DeleteVoterVariables): MutationPromise<DeleteVoterData, DeleteVoterVariables>;

interface DeleteVoterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteVoterVariables): MutationRef<DeleteVoterData, DeleteVoterVariables>;
}
export const deleteVoterRef: DeleteVoterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteVoter(dc: DataConnect, vars: DeleteVoterVariables): MutationPromise<DeleteVoterData, DeleteVoterVariables>;

interface DeleteVoterRef {
  ...
  (dc: DataConnect, vars: DeleteVoterVariables): MutationRef<DeleteVoterData, DeleteVoterVariables>;
}
export const deleteVoterRef: DeleteVoterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteVoterRef:
```typescript
const name = deleteVoterRef.operationName;
console.log(name);
```

### Variables
The `DeleteVoter` mutation requires an argument of type `DeleteVoterVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteVoterVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteVoter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteVoterData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteVoterData {
  voter_delete?: Voter_Key | null;
}
```
### Using `DeleteVoter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteVoter, DeleteVoterVariables } from '@vote/dataconnect';

// The `DeleteVoter` mutation requires an argument of type `DeleteVoterVariables`:
const deleteVoterVars: DeleteVoterVariables = {
  id: ..., 
};

// Call the `deleteVoter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteVoter(deleteVoterVars);
// Variables can be defined inline as well.
const { data } = await deleteVoter({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteVoter(dataConnect, deleteVoterVars);

console.log(data.voter_delete);

// Or, you can use the `Promise` API.
deleteVoter(deleteVoterVars).then((response) => {
  const data = response.data;
  console.log(data.voter_delete);
});
```

### Using `DeleteVoter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteVoterRef, DeleteVoterVariables } from '@vote/dataconnect';

// The `DeleteVoter` mutation requires an argument of type `DeleteVoterVariables`:
const deleteVoterVars: DeleteVoterVariables = {
  id: ..., 
};

// Call the `deleteVoterRef()` function to get a reference to the mutation.
const ref = deleteVoterRef(deleteVoterVars);
// Variables can be defined inline as well.
const ref = deleteVoterRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteVoterRef(dataConnect, deleteVoterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.voter_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.voter_delete);
});
```

## CreateCandidate
You can execute the `CreateCandidate` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createCandidate(vars: CreateCandidateVariables): MutationPromise<CreateCandidateData, CreateCandidateVariables>;

interface CreateCandidateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCandidateVariables): MutationRef<CreateCandidateData, CreateCandidateVariables>;
}
export const createCandidateRef: CreateCandidateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCandidate(dc: DataConnect, vars: CreateCandidateVariables): MutationPromise<CreateCandidateData, CreateCandidateVariables>;

interface CreateCandidateRef {
  ...
  (dc: DataConnect, vars: CreateCandidateVariables): MutationRef<CreateCandidateData, CreateCandidateVariables>;
}
export const createCandidateRef: CreateCandidateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCandidateRef:
```typescript
const name = createCandidateRef.operationName;
console.log(name);
```

### Variables
The `CreateCandidate` mutation requires an argument of type `CreateCandidateVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateCandidate` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCandidateData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCandidateData {
  candidate_insert: Candidate_Key;
}
```
### Using `CreateCandidate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCandidate, CreateCandidateVariables } from '@vote/dataconnect';

// The `CreateCandidate` mutation requires an argument of type `CreateCandidateVariables`:
const createCandidateVars: CreateCandidateVariables = {
  electionId: ..., 
  name: ..., 
  position: ..., 
  round: ..., 
  district: ..., // optional
  birthdate: ..., // optional
  photoUrl: ..., // optional
  profileDesc: ..., // optional
  volunteerInfo: ..., // optional
  candidateNumber: ..., // optional
};

// Call the `createCandidate()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCandidate(createCandidateVars);
// Variables can be defined inline as well.
const { data } = await createCandidate({ electionId: ..., name: ..., position: ..., round: ..., district: ..., birthdate: ..., photoUrl: ..., profileDesc: ..., volunteerInfo: ..., candidateNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCandidate(dataConnect, createCandidateVars);

console.log(data.candidate_insert);

// Or, you can use the `Promise` API.
createCandidate(createCandidateVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_insert);
});
```

### Using `CreateCandidate`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCandidateRef, CreateCandidateVariables } from '@vote/dataconnect';

// The `CreateCandidate` mutation requires an argument of type `CreateCandidateVariables`:
const createCandidateVars: CreateCandidateVariables = {
  electionId: ..., 
  name: ..., 
  position: ..., 
  round: ..., 
  district: ..., // optional
  birthdate: ..., // optional
  photoUrl: ..., // optional
  profileDesc: ..., // optional
  volunteerInfo: ..., // optional
  candidateNumber: ..., // optional
};

// Call the `createCandidateRef()` function to get a reference to the mutation.
const ref = createCandidateRef(createCandidateVars);
// Variables can be defined inline as well.
const ref = createCandidateRef({ electionId: ..., name: ..., position: ..., round: ..., district: ..., birthdate: ..., photoUrl: ..., profileDesc: ..., volunteerInfo: ..., candidateNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCandidateRef(dataConnect, createCandidateVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_insert);
});
```

## UpdateCandidate
You can execute the `UpdateCandidate` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateCandidate(vars: UpdateCandidateVariables): MutationPromise<UpdateCandidateData, UpdateCandidateVariables>;

interface UpdateCandidateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCandidateVariables): MutationRef<UpdateCandidateData, UpdateCandidateVariables>;
}
export const updateCandidateRef: UpdateCandidateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCandidate(dc: DataConnect, vars: UpdateCandidateVariables): MutationPromise<UpdateCandidateData, UpdateCandidateVariables>;

interface UpdateCandidateRef {
  ...
  (dc: DataConnect, vars: UpdateCandidateVariables): MutationRef<UpdateCandidateData, UpdateCandidateVariables>;
}
export const updateCandidateRef: UpdateCandidateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCandidateRef:
```typescript
const name = updateCandidateRef.operationName;
console.log(name);
```

### Variables
The `UpdateCandidate` mutation requires an argument of type `UpdateCandidateVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateCandidate` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCandidateData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCandidateData {
  candidate_update?: Candidate_Key | null;
}
```
### Using `UpdateCandidate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCandidate, UpdateCandidateVariables } from '@vote/dataconnect';

// The `UpdateCandidate` mutation requires an argument of type `UpdateCandidateVariables`:
const updateCandidateVars: UpdateCandidateVariables = {
  id: ..., 
  name: ..., 
  position: ..., // optional
  round: ..., // optional
  district: ..., // optional
  birthdate: ..., // optional
  photoUrl: ..., // optional
  profileDesc: ..., // optional
  volunteerInfo: ..., // optional
  candidateNumber: ..., // optional
};

// Call the `updateCandidate()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCandidate(updateCandidateVars);
// Variables can be defined inline as well.
const { data } = await updateCandidate({ id: ..., name: ..., position: ..., round: ..., district: ..., birthdate: ..., photoUrl: ..., profileDesc: ..., volunteerInfo: ..., candidateNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCandidate(dataConnect, updateCandidateVars);

console.log(data.candidate_update);

// Or, you can use the `Promise` API.
updateCandidate(updateCandidateVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_update);
});
```

### Using `UpdateCandidate`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCandidateRef, UpdateCandidateVariables } from '@vote/dataconnect';

// The `UpdateCandidate` mutation requires an argument of type `UpdateCandidateVariables`:
const updateCandidateVars: UpdateCandidateVariables = {
  id: ..., 
  name: ..., 
  position: ..., // optional
  round: ..., // optional
  district: ..., // optional
  birthdate: ..., // optional
  photoUrl: ..., // optional
  profileDesc: ..., // optional
  volunteerInfo: ..., // optional
  candidateNumber: ..., // optional
};

// Call the `updateCandidateRef()` function to get a reference to the mutation.
const ref = updateCandidateRef(updateCandidateVars);
// Variables can be defined inline as well.
const ref = updateCandidateRef({ id: ..., name: ..., position: ..., round: ..., district: ..., birthdate: ..., photoUrl: ..., profileDesc: ..., volunteerInfo: ..., candidateNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCandidateRef(dataConnect, updateCandidateVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_update);
});
```

## DeleteCandidate
You can execute the `DeleteCandidate` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteCandidate(vars: DeleteCandidateVariables): MutationPromise<DeleteCandidateData, DeleteCandidateVariables>;

interface DeleteCandidateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCandidateVariables): MutationRef<DeleteCandidateData, DeleteCandidateVariables>;
}
export const deleteCandidateRef: DeleteCandidateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCandidate(dc: DataConnect, vars: DeleteCandidateVariables): MutationPromise<DeleteCandidateData, DeleteCandidateVariables>;

interface DeleteCandidateRef {
  ...
  (dc: DataConnect, vars: DeleteCandidateVariables): MutationRef<DeleteCandidateData, DeleteCandidateVariables>;
}
export const deleteCandidateRef: DeleteCandidateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCandidateRef:
```typescript
const name = deleteCandidateRef.operationName;
console.log(name);
```

### Variables
The `DeleteCandidate` mutation requires an argument of type `DeleteCandidateVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCandidateVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCandidate` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCandidateData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCandidateData {
  candidate_delete?: Candidate_Key | null;
}
```
### Using `DeleteCandidate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCandidate, DeleteCandidateVariables } from '@vote/dataconnect';

// The `DeleteCandidate` mutation requires an argument of type `DeleteCandidateVariables`:
const deleteCandidateVars: DeleteCandidateVariables = {
  id: ..., 
};

// Call the `deleteCandidate()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCandidate(deleteCandidateVars);
// Variables can be defined inline as well.
const { data } = await deleteCandidate({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCandidate(dataConnect, deleteCandidateVars);

console.log(data.candidate_delete);

// Or, you can use the `Promise` API.
deleteCandidate(deleteCandidateVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_delete);
});
```

### Using `DeleteCandidate`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCandidateRef, DeleteCandidateVariables } from '@vote/dataconnect';

// The `DeleteCandidate` mutation requires an argument of type `DeleteCandidateVariables`:
const deleteCandidateVars: DeleteCandidateVariables = {
  id: ..., 
};

// Call the `deleteCandidateRef()` function to get a reference to the mutation.
const ref = deleteCandidateRef(deleteCandidateVars);
// Variables can be defined inline as well.
const ref = deleteCandidateRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCandidateRef(dataConnect, deleteCandidateVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_delete);
});
```

## DeleteCandidatesByRound
You can execute the `DeleteCandidatesByRound` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteCandidatesByRound(vars: DeleteCandidatesByRoundVariables): MutationPromise<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;

interface DeleteCandidatesByRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCandidatesByRoundVariables): MutationRef<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;
}
export const deleteCandidatesByRoundRef: DeleteCandidatesByRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCandidatesByRound(dc: DataConnect, vars: DeleteCandidatesByRoundVariables): MutationPromise<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;

interface DeleteCandidatesByRoundRef {
  ...
  (dc: DataConnect, vars: DeleteCandidatesByRoundVariables): MutationRef<DeleteCandidatesByRoundData, DeleteCandidatesByRoundVariables>;
}
export const deleteCandidatesByRoundRef: DeleteCandidatesByRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCandidatesByRoundRef:
```typescript
const name = deleteCandidatesByRoundRef.operationName;
console.log(name);
```

### Variables
The `DeleteCandidatesByRound` mutation requires an argument of type `DeleteCandidatesByRoundVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCandidatesByRoundVariables {
  electionId: string;
  position: string;
  round: number;
}
```
### Return Type
Recall that executing the `DeleteCandidatesByRound` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCandidatesByRoundData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCandidatesByRoundData {
  candidate_deleteMany: number;
}
```
### Using `DeleteCandidatesByRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCandidatesByRound, DeleteCandidatesByRoundVariables } from '@vote/dataconnect';

// The `DeleteCandidatesByRound` mutation requires an argument of type `DeleteCandidatesByRoundVariables`:
const deleteCandidatesByRoundVars: DeleteCandidatesByRoundVariables = {
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `deleteCandidatesByRound()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCandidatesByRound(deleteCandidatesByRoundVars);
// Variables can be defined inline as well.
const { data } = await deleteCandidatesByRound({ electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCandidatesByRound(dataConnect, deleteCandidatesByRoundVars);

console.log(data.candidate_deleteMany);

// Or, you can use the `Promise` API.
deleteCandidatesByRound(deleteCandidatesByRoundVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_deleteMany);
});
```

### Using `DeleteCandidatesByRound`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCandidatesByRoundRef, DeleteCandidatesByRoundVariables } from '@vote/dataconnect';

// The `DeleteCandidatesByRound` mutation requires an argument of type `DeleteCandidatesByRoundVariables`:
const deleteCandidatesByRoundVars: DeleteCandidatesByRoundVariables = {
  electionId: ..., 
  position: ..., 
  round: ..., 
};

// Call the `deleteCandidatesByRoundRef()` function to get a reference to the mutation.
const ref = deleteCandidatesByRoundRef(deleteCandidatesByRoundVars);
// Variables can be defined inline as well.
const ref = deleteCandidatesByRoundRef({ electionId: ..., position: ..., round: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCandidatesByRoundRef(dataConnect, deleteCandidatesByRoundVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_deleteMany);
});
```

## UpdateElectionSettings
You can execute the `UpdateElectionSettings` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateElectionSettings(vars: UpdateElectionSettingsVariables): MutationPromise<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;

interface UpdateElectionSettingsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateElectionSettingsVariables): MutationRef<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;
}
export const updateElectionSettingsRef: UpdateElectionSettingsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateElectionSettings(dc: DataConnect, vars: UpdateElectionSettingsVariables): MutationPromise<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;

interface UpdateElectionSettingsRef {
  ...
  (dc: DataConnect, vars: UpdateElectionSettingsVariables): MutationRef<UpdateElectionSettingsData, UpdateElectionSettingsVariables>;
}
export const updateElectionSettingsRef: UpdateElectionSettingsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateElectionSettingsRef:
```typescript
const name = updateElectionSettingsRef.operationName;
console.log(name);
```

### Variables
The `UpdateElectionSettings` mutation requires an argument of type `UpdateElectionSettingsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateElectionSettingsVariables {
  id: string;
  name?: string | null;
  maxVotes: number;
  rounds?: string | null;
  roundTitle?: string | null;
  startDate?: TimestampString | null;
  endDate?: TimestampString | null;
}
```
### Return Type
Recall that executing the `UpdateElectionSettings` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateElectionSettingsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateElectionSettingsData {
  election_update?: Election_Key | null;
}
```
### Using `UpdateElectionSettings`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateElectionSettings, UpdateElectionSettingsVariables } from '@vote/dataconnect';

// The `UpdateElectionSettings` mutation requires an argument of type `UpdateElectionSettingsVariables`:
const updateElectionSettingsVars: UpdateElectionSettingsVariables = {
  id: ..., 
  name: ..., // optional
  maxVotes: ..., 
  rounds: ..., // optional
  roundTitle: ..., // optional
  startDate: ..., // optional
  endDate: ..., // optional
};

// Call the `updateElectionSettings()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateElectionSettings(updateElectionSettingsVars);
// Variables can be defined inline as well.
const { data } = await updateElectionSettings({ id: ..., name: ..., maxVotes: ..., rounds: ..., roundTitle: ..., startDate: ..., endDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateElectionSettings(dataConnect, updateElectionSettingsVars);

console.log(data.election_update);

// Or, you can use the `Promise` API.
updateElectionSettings(updateElectionSettingsVars).then((response) => {
  const data = response.data;
  console.log(data.election_update);
});
```

### Using `UpdateElectionSettings`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateElectionSettingsRef, UpdateElectionSettingsVariables } from '@vote/dataconnect';

// The `UpdateElectionSettings` mutation requires an argument of type `UpdateElectionSettingsVariables`:
const updateElectionSettingsVars: UpdateElectionSettingsVariables = {
  id: ..., 
  name: ..., // optional
  maxVotes: ..., 
  rounds: ..., // optional
  roundTitle: ..., // optional
  startDate: ..., // optional
  endDate: ..., // optional
};

// Call the `updateElectionSettingsRef()` function to get a reference to the mutation.
const ref = updateElectionSettingsRef(updateElectionSettingsVars);
// Variables can be defined inline as well.
const ref = updateElectionSettingsRef({ id: ..., name: ..., maxVotes: ..., rounds: ..., roundTitle: ..., startDate: ..., endDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateElectionSettingsRef(dataConnect, updateElectionSettingsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.election_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.election_update);
});
```

## CreateAdminLog
You can execute the `CreateAdminLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAdminLog(vars: CreateAdminLogVariables): MutationPromise<CreateAdminLogData, CreateAdminLogVariables>;

interface CreateAdminLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAdminLogVariables): MutationRef<CreateAdminLogData, CreateAdminLogVariables>;
}
export const createAdminLogRef: CreateAdminLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAdminLog(dc: DataConnect, vars: CreateAdminLogVariables): MutationPromise<CreateAdminLogData, CreateAdminLogVariables>;

interface CreateAdminLogRef {
  ...
  (dc: DataConnect, vars: CreateAdminLogVariables): MutationRef<CreateAdminLogData, CreateAdminLogVariables>;
}
export const createAdminLogRef: CreateAdminLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAdminLogRef:
```typescript
const name = createAdminLogRef.operationName;
console.log(name);
```

### Variables
The `CreateAdminLog` mutation requires an argument of type `CreateAdminLogVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAdminLogVariables {
  electionId: string;
  adminId?: string | null;
  actionType: string;
  description: string;
}
```
### Return Type
Recall that executing the `CreateAdminLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAdminLogData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAdminLogData {
  adminLog_insert: AdminLog_Key;
}
```
### Using `CreateAdminLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAdminLog, CreateAdminLogVariables } from '@vote/dataconnect';

// The `CreateAdminLog` mutation requires an argument of type `CreateAdminLogVariables`:
const createAdminLogVars: CreateAdminLogVariables = {
  electionId: ..., 
  adminId: ..., // optional
  actionType: ..., 
  description: ..., 
};

// Call the `createAdminLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAdminLog(createAdminLogVars);
// Variables can be defined inline as well.
const { data } = await createAdminLog({ electionId: ..., adminId: ..., actionType: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAdminLog(dataConnect, createAdminLogVars);

console.log(data.adminLog_insert);

// Or, you can use the `Promise` API.
createAdminLog(createAdminLogVars).then((response) => {
  const data = response.data;
  console.log(data.adminLog_insert);
});
```

### Using `CreateAdminLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAdminLogRef, CreateAdminLogVariables } from '@vote/dataconnect';

// The `CreateAdminLog` mutation requires an argument of type `CreateAdminLogVariables`:
const createAdminLogVars: CreateAdminLogVariables = {
  electionId: ..., 
  adminId: ..., // optional
  actionType: ..., 
  description: ..., 
};

// Call the `createAdminLogRef()` function to get a reference to the mutation.
const ref = createAdminLogRef(createAdminLogVars);
// Variables can be defined inline as well.
const ref = createAdminLogRef({ electionId: ..., adminId: ..., actionType: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAdminLogRef(dataConnect, createAdminLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.adminLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.adminLog_insert);
});
```

## CreateAuditLog
You can execute the `CreateAuditLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAuditLog(vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface CreateAuditLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
}
export const createAuditLogRef: CreateAuditLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAuditLog(dc: DataConnect, vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface CreateAuditLogRef {
  ...
  (dc: DataConnect, vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
}
export const createAuditLogRef: CreateAuditLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAuditLogRef:
```typescript
const name = createAuditLogRef.operationName;
console.log(name);
```

### Variables
The `CreateAuditLog` mutation requires an argument of type `CreateAuditLogVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAuditLogVariables {
  electionId: string;
  voterId?: string | null;
  voterName?: string | null;
  actionType: string;
  approvedBy?: string | null;
  ipAddress?: string | null;
}
```
### Return Type
Recall that executing the `CreateAuditLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAuditLogData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAuditLogData {
  auditLog_insert: AuditLog_Key;
}
```
### Using `CreateAuditLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAuditLog, CreateAuditLogVariables } from '@vote/dataconnect';

// The `CreateAuditLog` mutation requires an argument of type `CreateAuditLogVariables`:
const createAuditLogVars: CreateAuditLogVariables = {
  electionId: ..., 
  voterId: ..., // optional
  voterName: ..., // optional
  actionType: ..., 
  approvedBy: ..., // optional
  ipAddress: ..., // optional
};

// Call the `createAuditLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAuditLog(createAuditLogVars);
// Variables can be defined inline as well.
const { data } = await createAuditLog({ electionId: ..., voterId: ..., voterName: ..., actionType: ..., approvedBy: ..., ipAddress: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAuditLog(dataConnect, createAuditLogVars);

console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
createAuditLog(createAuditLogVars).then((response) => {
  const data = response.data;
  console.log(data.auditLog_insert);
});
```

### Using `CreateAuditLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAuditLogRef, CreateAuditLogVariables } from '@vote/dataconnect';

// The `CreateAuditLog` mutation requires an argument of type `CreateAuditLogVariables`:
const createAuditLogVars: CreateAuditLogVariables = {
  electionId: ..., 
  voterId: ..., // optional
  voterName: ..., // optional
  actionType: ..., 
  approvedBy: ..., // optional
  ipAddress: ..., // optional
};

// Call the `createAuditLogRef()` function to get a reference to the mutation.
const ref = createAuditLogRef(createAuditLogVars);
// Variables can be defined inline as well.
const ref = createAuditLogRef({ electionId: ..., voterId: ..., voterName: ..., actionType: ..., approvedBy: ..., ipAddress: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAuditLogRef(dataConnect, createAuditLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLog_insert);
});
```

## CreateElection
You can execute the `CreateElection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createElection(vars: CreateElectionVariables): MutationPromise<CreateElectionData, CreateElectionVariables>;

interface CreateElectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateElectionVariables): MutationRef<CreateElectionData, CreateElectionVariables>;
}
export const createElectionRef: CreateElectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createElection(dc: DataConnect, vars: CreateElectionVariables): MutationPromise<CreateElectionData, CreateElectionVariables>;

interface CreateElectionRef {
  ...
  (dc: DataConnect, vars: CreateElectionVariables): MutationRef<CreateElectionData, CreateElectionVariables>;
}
export const createElectionRef: CreateElectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createElectionRef:
```typescript
const name = createElectionRef.operationName;
console.log(name);
```

### Variables
The `CreateElection` mutation requires an argument of type `CreateElectionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateElectionVariables {
  id: string;
  name?: string | null;
  maxVotes: number;
}
```
### Return Type
Recall that executing the `CreateElection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateElectionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateElectionData {
  election_insert: Election_Key;
}
```
### Using `CreateElection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createElection, CreateElectionVariables } from '@vote/dataconnect';

// The `CreateElection` mutation requires an argument of type `CreateElectionVariables`:
const createElectionVars: CreateElectionVariables = {
  id: ..., 
  name: ..., // optional
  maxVotes: ..., 
};

// Call the `createElection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createElection(createElectionVars);
// Variables can be defined inline as well.
const { data } = await createElection({ id: ..., name: ..., maxVotes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createElection(dataConnect, createElectionVars);

console.log(data.election_insert);

// Or, you can use the `Promise` API.
createElection(createElectionVars).then((response) => {
  const data = response.data;
  console.log(data.election_insert);
});
```

### Using `CreateElection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createElectionRef, CreateElectionVariables } from '@vote/dataconnect';

// The `CreateElection` mutation requires an argument of type `CreateElectionVariables`:
const createElectionVars: CreateElectionVariables = {
  id: ..., 
  name: ..., // optional
  maxVotes: ..., 
};

// Call the `createElectionRef()` function to get a reference to the mutation.
const ref = createElectionRef(createElectionVars);
// Variables can be defined inline as well.
const ref = createElectionRef({ id: ..., name: ..., maxVotes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createElectionRef(dataConnect, createElectionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.election_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.election_insert);
});
```

## UpdateActiveElection
You can execute the `UpdateActiveElection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateActiveElection(vars: UpdateActiveElectionVariables): MutationPromise<UpdateActiveElectionData, UpdateActiveElectionVariables>;

interface UpdateActiveElectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateActiveElectionVariables): MutationRef<UpdateActiveElectionData, UpdateActiveElectionVariables>;
}
export const updateActiveElectionRef: UpdateActiveElectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateActiveElection(dc: DataConnect, vars: UpdateActiveElectionVariables): MutationPromise<UpdateActiveElectionData, UpdateActiveElectionVariables>;

interface UpdateActiveElectionRef {
  ...
  (dc: DataConnect, vars: UpdateActiveElectionVariables): MutationRef<UpdateActiveElectionData, UpdateActiveElectionVariables>;
}
export const updateActiveElectionRef: UpdateActiveElectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateActiveElectionRef:
```typescript
const name = updateActiveElectionRef.operationName;
console.log(name);
```

### Variables
The `UpdateActiveElection` mutation requires an argument of type `UpdateActiveElectionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateActiveElectionVariables {
  systemId: string;
  electionId: string;
}
```
### Return Type
Recall that executing the `UpdateActiveElection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateActiveElectionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateActiveElectionData {
  systemSetting_update?: SystemSetting_Key | null;
}
```
### Using `UpdateActiveElection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateActiveElection, UpdateActiveElectionVariables } from '@vote/dataconnect';

// The `UpdateActiveElection` mutation requires an argument of type `UpdateActiveElectionVariables`:
const updateActiveElectionVars: UpdateActiveElectionVariables = {
  systemId: ..., 
  electionId: ..., 
};

// Call the `updateActiveElection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateActiveElection(updateActiveElectionVars);
// Variables can be defined inline as well.
const { data } = await updateActiveElection({ systemId: ..., electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateActiveElection(dataConnect, updateActiveElectionVars);

console.log(data.systemSetting_update);

// Or, you can use the `Promise` API.
updateActiveElection(updateActiveElectionVars).then((response) => {
  const data = response.data;
  console.log(data.systemSetting_update);
});
```

### Using `UpdateActiveElection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateActiveElectionRef, UpdateActiveElectionVariables } from '@vote/dataconnect';

// The `UpdateActiveElection` mutation requires an argument of type `UpdateActiveElectionVariables`:
const updateActiveElectionVars: UpdateActiveElectionVariables = {
  systemId: ..., 
  electionId: ..., 
};

// Call the `updateActiveElectionRef()` function to get a reference to the mutation.
const ref = updateActiveElectionRef(updateActiveElectionVars);
// Variables can be defined inline as well.
const ref = updateActiveElectionRef({ systemId: ..., electionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateActiveElectionRef(dataConnect, updateActiveElectionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.systemSetting_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.systemSetting_update);
});
```

## DeleteAllCandidates
You can execute the `DeleteAllCandidates` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteAllCandidates(vars: DeleteAllCandidatesVariables): MutationPromise<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;

interface DeleteAllCandidatesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAllCandidatesVariables): MutationRef<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;
}
export const deleteAllCandidatesRef: DeleteAllCandidatesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAllCandidates(dc: DataConnect, vars: DeleteAllCandidatesVariables): MutationPromise<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;

interface DeleteAllCandidatesRef {
  ...
  (dc: DataConnect, vars: DeleteAllCandidatesVariables): MutationRef<DeleteAllCandidatesData, DeleteAllCandidatesVariables>;
}
export const deleteAllCandidatesRef: DeleteAllCandidatesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAllCandidatesRef:
```typescript
const name = deleteAllCandidatesRef.operationName;
console.log(name);
```

### Variables
The `DeleteAllCandidates` mutation requires an argument of type `DeleteAllCandidatesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAllCandidatesVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `DeleteAllCandidates` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAllCandidatesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAllCandidatesData {
  candidate_deleteMany: number;
}
```
### Using `DeleteAllCandidates`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAllCandidates, DeleteAllCandidatesVariables } from '@vote/dataconnect';

// The `DeleteAllCandidates` mutation requires an argument of type `DeleteAllCandidatesVariables`:
const deleteAllCandidatesVars: DeleteAllCandidatesVariables = {
  electionId: ..., 
};

// Call the `deleteAllCandidates()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAllCandidates(deleteAllCandidatesVars);
// Variables can be defined inline as well.
const { data } = await deleteAllCandidates({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAllCandidates(dataConnect, deleteAllCandidatesVars);

console.log(data.candidate_deleteMany);

// Or, you can use the `Promise` API.
deleteAllCandidates(deleteAllCandidatesVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_deleteMany);
});
```

### Using `DeleteAllCandidates`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAllCandidatesRef, DeleteAllCandidatesVariables } from '@vote/dataconnect';

// The `DeleteAllCandidates` mutation requires an argument of type `DeleteAllCandidatesVariables`:
const deleteAllCandidatesVars: DeleteAllCandidatesVariables = {
  electionId: ..., 
};

// Call the `deleteAllCandidatesRef()` function to get a reference to the mutation.
const ref = deleteAllCandidatesRef(deleteAllCandidatesVars);
// Variables can be defined inline as well.
const ref = deleteAllCandidatesRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAllCandidatesRef(dataConnect, deleteAllCandidatesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_deleteMany);
});
```

## DeleteAllVoters
You can execute the `DeleteAllVoters` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteAllVoters(vars: DeleteAllVotersVariables): MutationPromise<DeleteAllVotersData, DeleteAllVotersVariables>;

interface DeleteAllVotersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAllVotersVariables): MutationRef<DeleteAllVotersData, DeleteAllVotersVariables>;
}
export const deleteAllVotersRef: DeleteAllVotersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAllVoters(dc: DataConnect, vars: DeleteAllVotersVariables): MutationPromise<DeleteAllVotersData, DeleteAllVotersVariables>;

interface DeleteAllVotersRef {
  ...
  (dc: DataConnect, vars: DeleteAllVotersVariables): MutationRef<DeleteAllVotersData, DeleteAllVotersVariables>;
}
export const deleteAllVotersRef: DeleteAllVotersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAllVotersRef:
```typescript
const name = deleteAllVotersRef.operationName;
console.log(name);
```

### Variables
The `DeleteAllVoters` mutation requires an argument of type `DeleteAllVotersVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAllVotersVariables {
  electionId: string;
}
```
### Return Type
Recall that executing the `DeleteAllVoters` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAllVotersData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAllVotersData {
  voter_deleteMany: number;
}
```
### Using `DeleteAllVoters`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAllVoters, DeleteAllVotersVariables } from '@vote/dataconnect';

// The `DeleteAllVoters` mutation requires an argument of type `DeleteAllVotersVariables`:
const deleteAllVotersVars: DeleteAllVotersVariables = {
  electionId: ..., 
};

// Call the `deleteAllVoters()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAllVoters(deleteAllVotersVars);
// Variables can be defined inline as well.
const { data } = await deleteAllVoters({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAllVoters(dataConnect, deleteAllVotersVars);

console.log(data.voter_deleteMany);

// Or, you can use the `Promise` API.
deleteAllVoters(deleteAllVotersVars).then((response) => {
  const data = response.data;
  console.log(data.voter_deleteMany);
});
```

### Using `DeleteAllVoters`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAllVotersRef, DeleteAllVotersVariables } from '@vote/dataconnect';

// The `DeleteAllVoters` mutation requires an argument of type `DeleteAllVotersVariables`:
const deleteAllVotersVars: DeleteAllVotersVariables = {
  electionId: ..., 
};

// Call the `deleteAllVotersRef()` function to get a reference to the mutation.
const ref = deleteAllVotersRef(deleteAllVotersVars);
// Variables can be defined inline as well.
const ref = deleteAllVotersRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAllVotersRef(dataConnect, deleteAllVotersVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.voter_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.voter_deleteMany);
});
```

## CreateMember
You can execute the `CreateMember` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createMember(vars: CreateMemberVariables): MutationPromise<CreateMemberData, CreateMemberVariables>;

interface CreateMemberRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMemberVariables): MutationRef<CreateMemberData, CreateMemberVariables>;
}
export const createMemberRef: CreateMemberRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMember(dc: DataConnect, vars: CreateMemberVariables): MutationPromise<CreateMemberData, CreateMemberVariables>;

interface CreateMemberRef {
  ...
  (dc: DataConnect, vars: CreateMemberVariables): MutationRef<CreateMemberData, CreateMemberVariables>;
}
export const createMemberRef: CreateMemberRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMemberRef:
```typescript
const name = createMemberRef.operationName;
console.log(name);
```

### Variables
The `CreateMember` mutation requires an argument of type `CreateMemberVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMemberVariables {
  name: string;
  phone?: string | null;
  birthdate?: string | null;
  originalId?: string | null;
}
```
### Return Type
Recall that executing the `CreateMember` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMemberData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMemberData {
  member_insert: Member_Key;
}
```
### Using `CreateMember`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMember, CreateMemberVariables } from '@vote/dataconnect';

// The `CreateMember` mutation requires an argument of type `CreateMemberVariables`:
const createMemberVars: CreateMemberVariables = {
  name: ..., 
  phone: ..., // optional
  birthdate: ..., // optional
  originalId: ..., // optional
};

// Call the `createMember()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMember(createMemberVars);
// Variables can be defined inline as well.
const { data } = await createMember({ name: ..., phone: ..., birthdate: ..., originalId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMember(dataConnect, createMemberVars);

console.log(data.member_insert);

// Or, you can use the `Promise` API.
createMember(createMemberVars).then((response) => {
  const data = response.data;
  console.log(data.member_insert);
});
```

### Using `CreateMember`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMemberRef, CreateMemberVariables } from '@vote/dataconnect';

// The `CreateMember` mutation requires an argument of type `CreateMemberVariables`:
const createMemberVars: CreateMemberVariables = {
  name: ..., 
  phone: ..., // optional
  birthdate: ..., // optional
  originalId: ..., // optional
};

// Call the `createMemberRef()` function to get a reference to the mutation.
const ref = createMemberRef(createMemberVars);
// Variables can be defined inline as well.
const ref = createMemberRef({ name: ..., phone: ..., birthdate: ..., originalId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMemberRef(dataConnect, createMemberVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.member_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.member_insert);
});
```

## UpdateSystemService
You can execute the `UpdateSystemService` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateSystemService(vars: UpdateSystemServiceVariables): MutationPromise<UpdateSystemServiceData, UpdateSystemServiceVariables>;

interface UpdateSystemServiceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSystemServiceVariables): MutationRef<UpdateSystemServiceData, UpdateSystemServiceVariables>;
}
export const updateSystemServiceRef: UpdateSystemServiceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSystemService(dc: DataConnect, vars: UpdateSystemServiceVariables): MutationPromise<UpdateSystemServiceData, UpdateSystemServiceVariables>;

interface UpdateSystemServiceRef {
  ...
  (dc: DataConnect, vars: UpdateSystemServiceVariables): MutationRef<UpdateSystemServiceData, UpdateSystemServiceVariables>;
}
export const updateSystemServiceRef: UpdateSystemServiceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSystemServiceRef:
```typescript
const name = updateSystemServiceRef.operationName;
console.log(name);
```

### Variables
The `UpdateSystemService` mutation requires an argument of type `UpdateSystemServiceVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSystemServiceVariables {
  systemId: string;
  activeService?: string | null;
  activeSurveyId?: string | null;
}
```
### Return Type
Recall that executing the `UpdateSystemService` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSystemServiceData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSystemServiceData {
  systemSetting_update?: SystemSetting_Key | null;
}
```
### Using `UpdateSystemService`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSystemService, UpdateSystemServiceVariables } from '@vote/dataconnect';

// The `UpdateSystemService` mutation requires an argument of type `UpdateSystemServiceVariables`:
const updateSystemServiceVars: UpdateSystemServiceVariables = {
  systemId: ..., 
  activeService: ..., // optional
  activeSurveyId: ..., // optional
};

// Call the `updateSystemService()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSystemService(updateSystemServiceVars);
// Variables can be defined inline as well.
const { data } = await updateSystemService({ systemId: ..., activeService: ..., activeSurveyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSystemService(dataConnect, updateSystemServiceVars);

console.log(data.systemSetting_update);

// Or, you can use the `Promise` API.
updateSystemService(updateSystemServiceVars).then((response) => {
  const data = response.data;
  console.log(data.systemSetting_update);
});
```

### Using `UpdateSystemService`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSystemServiceRef, UpdateSystemServiceVariables } from '@vote/dataconnect';

// The `UpdateSystemService` mutation requires an argument of type `UpdateSystemServiceVariables`:
const updateSystemServiceVars: UpdateSystemServiceVariables = {
  systemId: ..., 
  activeService: ..., // optional
  activeSurveyId: ..., // optional
};

// Call the `updateSystemServiceRef()` function to get a reference to the mutation.
const ref = updateSystemServiceRef(updateSystemServiceVars);
// Variables can be defined inline as well.
const ref = updateSystemServiceRef({ systemId: ..., activeService: ..., activeSurveyId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSystemServiceRef(dataConnect, updateSystemServiceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.systemSetting_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.systemSetting_update);
});
```

## CreateSurvey
You can execute the `CreateSurvey` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createSurvey(vars: CreateSurveyVariables): MutationPromise<CreateSurveyData, CreateSurveyVariables>;

interface CreateSurveyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSurveyVariables): MutationRef<CreateSurveyData, CreateSurveyVariables>;
}
export const createSurveyRef: CreateSurveyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSurvey(dc: DataConnect, vars: CreateSurveyVariables): MutationPromise<CreateSurveyData, CreateSurveyVariables>;

interface CreateSurveyRef {
  ...
  (dc: DataConnect, vars: CreateSurveyVariables): MutationRef<CreateSurveyData, CreateSurveyVariables>;
}
export const createSurveyRef: CreateSurveyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSurveyRef:
```typescript
const name = createSurveyRef.operationName;
console.log(name);
```

### Variables
The `CreateSurvey` mutation requires an argument of type `CreateSurveyVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSurveyVariables {
  title: string;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateSurvey` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSurveyData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSurveyData {
  survey_insert: Survey_Key;
}
```
### Using `CreateSurvey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSurvey, CreateSurveyVariables } from '@vote/dataconnect';

// The `CreateSurvey` mutation requires an argument of type `CreateSurveyVariables`:
const createSurveyVars: CreateSurveyVariables = {
  title: ..., 
  description: ..., // optional
};

// Call the `createSurvey()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSurvey(createSurveyVars);
// Variables can be defined inline as well.
const { data } = await createSurvey({ title: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSurvey(dataConnect, createSurveyVars);

console.log(data.survey_insert);

// Or, you can use the `Promise` API.
createSurvey(createSurveyVars).then((response) => {
  const data = response.data;
  console.log(data.survey_insert);
});
```

### Using `CreateSurvey`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSurveyRef, CreateSurveyVariables } from '@vote/dataconnect';

// The `CreateSurvey` mutation requires an argument of type `CreateSurveyVariables`:
const createSurveyVars: CreateSurveyVariables = {
  title: ..., 
  description: ..., // optional
};

// Call the `createSurveyRef()` function to get a reference to the mutation.
const ref = createSurveyRef(createSurveyVars);
// Variables can be defined inline as well.
const ref = createSurveyRef({ title: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSurveyRef(dataConnect, createSurveyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.survey_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.survey_insert);
});
```

## SubmitSurveyResponse
You can execute the `SubmitSurveyResponse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
submitSurveyResponse(vars: SubmitSurveyResponseVariables): MutationPromise<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;

interface SubmitSurveyResponseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitSurveyResponseVariables): MutationRef<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;
}
export const submitSurveyResponseRef: SubmitSurveyResponseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
submitSurveyResponse(dc: DataConnect, vars: SubmitSurveyResponseVariables): MutationPromise<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;

interface SubmitSurveyResponseRef {
  ...
  (dc: DataConnect, vars: SubmitSurveyResponseVariables): MutationRef<SubmitSurveyResponseData, SubmitSurveyResponseVariables>;
}
export const submitSurveyResponseRef: SubmitSurveyResponseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the submitSurveyResponseRef:
```typescript
const name = submitSurveyResponseRef.operationName;
console.log(name);
```

### Variables
The `SubmitSurveyResponse` mutation requires an argument of type `SubmitSurveyResponseVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SubmitSurveyResponseVariables {
  surveyId: UUIDString;
  memberId: UUIDString;
  answers: string;
}
```
### Return Type
Recall that executing the `SubmitSurveyResponse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SubmitSurveyResponseData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SubmitSurveyResponseData {
  surveyResponse_insert: SurveyResponse_Key;
}
```
### Using `SubmitSurveyResponse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, submitSurveyResponse, SubmitSurveyResponseVariables } from '@vote/dataconnect';

// The `SubmitSurveyResponse` mutation requires an argument of type `SubmitSurveyResponseVariables`:
const submitSurveyResponseVars: SubmitSurveyResponseVariables = {
  surveyId: ..., 
  memberId: ..., 
  answers: ..., 
};

// Call the `submitSurveyResponse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await submitSurveyResponse(submitSurveyResponseVars);
// Variables can be defined inline as well.
const { data } = await submitSurveyResponse({ surveyId: ..., memberId: ..., answers: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await submitSurveyResponse(dataConnect, submitSurveyResponseVars);

console.log(data.surveyResponse_insert);

// Or, you can use the `Promise` API.
submitSurveyResponse(submitSurveyResponseVars).then((response) => {
  const data = response.data;
  console.log(data.surveyResponse_insert);
});
```

### Using `SubmitSurveyResponse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, submitSurveyResponseRef, SubmitSurveyResponseVariables } from '@vote/dataconnect';

// The `SubmitSurveyResponse` mutation requires an argument of type `SubmitSurveyResponseVariables`:
const submitSurveyResponseVars: SubmitSurveyResponseVariables = {
  surveyId: ..., 
  memberId: ..., 
  answers: ..., 
};

// Call the `submitSurveyResponseRef()` function to get a reference to the mutation.
const ref = submitSurveyResponseRef(submitSurveyResponseVars);
// Variables can be defined inline as well.
const ref = submitSurveyResponseRef({ surveyId: ..., memberId: ..., answers: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = submitSurveyResponseRef(dataConnect, submitSurveyResponseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.surveyResponse_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.surveyResponse_insert);
});
```

