import { Team } from '@prisma/client';

export const GameTeamJoinTopic = 'GAME_TEAM_JOIN';
export type GameTeamJoinPayload = Team;