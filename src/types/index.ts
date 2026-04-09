export interface Candidate {
    id?: string; // Firestore ID
    name: string;
    position: string; // e.g., '장로', '안수집사', '권사'
    birthdate?: string | null; // YYYYMMDD or equivalent
    age?: number | null; // Deprecated, but keeping for legacy
    photoUrl?: string | null; // Original or transformed URL
    voteCount: number; // For backward compatibility (or current round total)
    votesByRound?: { [key: number]: number } | null; // e.g. { 1: 50, 2: 30 }
    round?: number; // The round this candidate belongs to (Default 1)
    profileDesc?: string | null; // Career/Service History
    volunteerInfo?: string | null; // Volunteer History
    churchTitle?: string | null; // e.g. '교인', '집사'
    district?: string | null; // e.g. '1교구'
    candidateNumber?: number | null; // 기호 번호 (관리자 직접 설정)
}

export interface Voter {
    id?: string;
    name: string;
    authKey: string; 
    hasVoted: boolean; 
    participatedRounds?: number[]; 
    participated?: { [positionAndRound: string]: boolean }; 
    votedAt?: string | number | null; 
    phone?: string;
    birthdate?: string;
}

export interface SystemSettings {
    maxVotes: number;
    rounds: { [position: string]: number }; 
    roundTitle?: string;
    startDate?: string; 
    endDate?: string;   
}

export interface AdminLog {
    id?: string;
    electionId: string;
    actionType: 'CREATE_ELECTION' | 'UPDATE_SETTINGS' | 'UPLOAD_CANDIDATES' | 'DELETE_CANDIDATE' | 'UPLOAD_VOTERS' | 'ADD_SINGLE_VOTER' | 'RESET_DATA' | 'DOWNLOAD_RESULTS' | 'DOWNLOAD_VOTERS' | 'DOWNLOAD_TEMPLATE' | 'OTHER';
    description: string;
    timestamp: string | number;
    adminId?: string; 
}
