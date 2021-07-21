import { User, Team } from '@prisma/client';

export const TeamUserJoinTopic = 'TEAM_USER_JOIN';
export type TeamUserJoinPayload = User & { team: Team };