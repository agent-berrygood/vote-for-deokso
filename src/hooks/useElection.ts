import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SYSTEM_SETTINGS_DOC = 'settings/system';
const DEFAULT_ELECTION_ID = 'default-2026';

export function useElection() {
    const [activeElectionId, setActiveElectionId] = useState<string | null>(null);
    const [electionList, setElectionList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, SYSTEM_SETTINGS_DOC), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setActiveElectionId(data.activeElectionId || DEFAULT_ELECTION_ID);
                setElectionList(data.electionList || [DEFAULT_ELECTION_ID]);
                setError(null);
            } else {
                // Initialize if not exists
                const initData = {
                    activeElectionId: DEFAULT_ELECTION_ID,
                    electionList: [DEFAULT_ELECTION_ID]
                };
                setDoc(doc(db, SYSTEM_SETTINGS_DOC), initData);
                setActiveElectionId(DEFAULT_ELECTION_ID);
                setElectionList([DEFAULT_ELECTION_ID]);
            }
            setLoading(false);
        }, (err) => {
            console.error("Failed to subscribe to election settings:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createElection = async (newId: string) => {
        if (!newId) return;
        if (electionList.includes(newId)) {
            alert('Election ID already exists.');
            return;
        }

        const newList = [...electionList, newId];
        await setDoc(doc(db, SYSTEM_SETTINGS_DOC), {
            activeElectionId: activeElectionId, // Keep current active
            electionList: newList
        }, { merge: true });
    };

    const switchElection = async (targetId: string) => {
        await setDoc(doc(db, SYSTEM_SETTINGS_DOC), {
            activeElectionId: targetId
        }, { merge: true });
    };

    // Helper to get collection paths based on active ID
    const getElectionPath = (collectionName: string) => {
        const id = activeElectionId || DEFAULT_ELECTION_ID;
        return `elections/${id}/${collectionName}`;
    };

    return {
        activeElectionId,
        electionList,
        loading,
        createElection,
        switchElection,
        getElectionPath,
        error
    };
}
