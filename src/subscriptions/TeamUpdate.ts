import { Team } from '@prisma/client';

export const TeamUpdateTopic = 'TEAM_UPDATE';
export type TeamUpdatePayload = Team & { __deleted?: boolean };