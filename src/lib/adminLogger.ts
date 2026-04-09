import { AdminLog } from '@/types';
import { createAdminLog } from '@/lib/dataconnect';

export const logAdminAction = async (logData: Omit<AdminLog, 'id' | 'timestamp'>) => {
    try {
        await createAdminLog({
            electionId: logData.electionId,
            adminId: logData.adminId || 'system',
            actionType: logData.actionType,
            description: logData.description
        });
    } catch (error) {
        console.error("Failed to log admin action to Data Connect:", error);
        // 메인 로직 흐름을 방해하지 않기 위해 에러를 던지지 않음
    }
};
