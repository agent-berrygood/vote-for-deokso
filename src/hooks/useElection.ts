import { useState, useEffect, useCallback } from 'react';
import { getSystemSetting, listElections, createElection as createElectionMutation, updateActiveElection } from '@/lib/dataconnect';

const DEFAULT_ELECTION_ID = 'default-2026';
const SYSTEM_SETTINGS_ID = 'system';

export function useElection() {
    const [activeElectionId, setActiveElectionId] = useState<string | null>(null);
    const [activeService, setActiveService] = useState<'ELECTION' | 'SURVEY'>('ELECTION');
    const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null);
    const [electionList, setElectionList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch System Settings (Active Election)
            const sysRes = await getSystemSetting({ id: SYSTEM_SETTINGS_ID });
            const sysData = sysRes.data.systemSetting;

            if (sysData && sysData.activeElection) {
                setActiveElectionId(sysData.activeElection.id);
            } else {
                setActiveElectionId(DEFAULT_ELECTION_ID);
            }

            if (sysData && sysData.activeService) {
                setActiveService(sysData.activeService as 'ELECTION' | 'SURVEY');
            }
            if (sysData && sysData.activeSurveyId) {
                setActiveSurveyId(sysData.activeSurveyId);
            }

            // 2. Fetch All Elections List
            const elecRes = await listElections();
            const elecData = elecRes.data.elections;
            setElectionList(elecData.map(e => e.id));
            
            setError(null);
        } catch (err: unknown) {
            console.error("Failed to fetch election data from SQL:", err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const createElection = async (newId: string) => {
        try {
            await createElectionMutation({ 
                id: newId, 
                name: newId, 
                maxVotes: 5 
            });
            await refreshData();
        } catch (err: unknown) {
            console.error("Failed to create election in SQL:", err);
            throw err;
        }
    };

    const switchElection = async (targetId: string) => {
        try {
            await updateActiveElection({ 
                systemId: SYSTEM_SETTINGS_ID, 
                electionId: targetId 
            });
            await refreshData();
        } catch (err: unknown) {
            console.error("Failed to switch election in SQL:", err);
            throw err;
        }
    };

    // Helper for Legacy Compatibility (Gradually remove)
    const getElectionPath = (collectionName: string) => {
        const id = activeElectionId || DEFAULT_ELECTION_ID;
        return `elections/${id}/${collectionName}`;
    };

    return {
        activeElectionId,
        activeService,
        activeSurveyId,
        electionList,
        loading,
        createElection,
        switchElection,
        getElectionPath,
        refreshData,
        error
    };
}
