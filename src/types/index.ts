export interface Candidate {
    id?: string; // Firestore ID
    name: string;
    position: string; // e.g., '장로', '안수집사', '권사'
    age: number;
    photoUrl: string; // Original or transformed URL
    voteCount: number;
}

export interface Voter {
    id?: string;
    name: string;
    authKey: string; // Unique key (Birthday 4 digits etc.)
    hasVoted: boolean;
    votedAt?: number | null; // Timestamp
}

export interface SystemSettings {
    maxVotes: number;
}
