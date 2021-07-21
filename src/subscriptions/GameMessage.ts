import { Message } from '@prisma/client';

export const GameMessageTopic = 'GAME_MESSAGE';
export type GameMessagePayload = Message & { __deleted?: boolean };