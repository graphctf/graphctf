import { Team } from '@prisma/client';

export const GameTeamUpdateTopic = 'GAME_TEAM_UPDATE';
export type GameTeamUpdatePayload = Team & { __deleted?: boolean };