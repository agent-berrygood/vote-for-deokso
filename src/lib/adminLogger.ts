import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLog } from '@/types';

export const logAdminAction = async (logData: Omit<AdminLog, 'id' | 'timestamp'>) => {
    try {
        const adminLogsRef = collection(db, 'adminLogs');
        const newLog: AdminLog = {
            ...logData,
            timestamp: Date.now(),
        };

        await addDoc(adminLogsRef, newLog);
    } catch (error) {
        console.error("Failed to log admin action:", error);
        // We generally shouldn't throw here to avoid disrupting the main action flow
    }
};
