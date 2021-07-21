import { Game } from '@prisma/client';

export const GameUpdateTopic = 'GAME_UPDATED';
export type GameUpdatePayload = Game & { __deleted?: boolean };