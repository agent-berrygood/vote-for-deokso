export interface Candidate {
    id?: string; // Firestore ID
    name: string;
    position: string; // e.g., '장로', '안수집사', '권사'
    age: number;
    photoUrl: string; // Original or transformed URL
    voteCount: number; // For backward compatibility (or current round total)
    votesByRound?: { [key: number]: number }; // e.g. { 1: 50, 2: 30 }
    round?: number; // The round this candidate belongs to (Default 1)
}

export interface Voter {
    id?: string;
    name: string;
    authKey: string; // Unique key (Birthday 4 digits etc.)
    hasVoted: boolean; // For backward compatibility
    participatedRounds?: number[]; // e.g. [1, 2] - tracks which rounds the voter has participated in (Globally? Or per position?)
    // Note: If rounds are per-position, we might need a more complex structure, but for simplicity, 
    // let's assume 'Round 1' involves voting for ALL active positions in that round.
    // If 'Elders' are in Round 2 and 'Deacons' in Round 1, the voter votes for both in one session?
    // Let's assume the Voter participates in a "Global Round Index" or we track { '장로': [1], '권사': [1] }?
    // To keep it simple and manageable: The "Event" has a Round. Or better:
    // If the User is allowed to vote for 'Elders Round 2', we track that they voted for 'Elders Round 2'.
    participated?: { [positionAndRound: string]: boolean }; // e.g. "장로_1": true, "안수집사_2": true
    votedAt?: number | null; // Timestamp of last vote
    phone?: string;
    birthdate?: string;
}

export interface SystemSettings {
    maxVotes: number;
    // currentRound is deprecated in favor of rounds mapping
    rounds: { [position: string]: number }; // e.g. { '장로': 2, '권사': 1, '안수집사': 1 }
    roundTitle?: string;
}
