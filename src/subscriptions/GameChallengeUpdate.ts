import { Challenge } from '@prisma/client';

export const GameChallengeUpdateTopic = 'GAME_CHALLENGE_UPDATE';
export type GameChallengeUpdatePayload = Challenge & { __deleted?: boolean };