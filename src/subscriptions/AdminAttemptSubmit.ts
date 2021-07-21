import { Attempt } from '@prisma/client';

export const AdminAttemptSubmitTopic = 'ADMIN_ATTEMPT_SUBMIT';
export type AdminAttemptSubmitPayload = Attempt & { __deleted?: boolean };