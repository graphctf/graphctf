import { FindOneIdInput } from '~/inputs';
import { Context } from '~/context';
import { GameMessagePayload } from './GameMessage';
import { GameScoreUpdatePayload } from './GameScoreUpdate';
import { GameTeamJoinPayload } from './GameTeamJoin';
import { GameTeamUpdatePayload } from './GameTeamUpdate';
import { GameTeamUserJoinPayload } from './GameTeamUserJoin';
import { GameUpdatePayload } from './GameUpdate';
import { GameChallengeUpdatePayload } from './GameChallengeUpdate';

interface GameSubscriptionArgs {
  where?: FindOneIdInput
}

interface FilterGameSubscriptionAgrs {
  args: GameSubscriptionArgs
  payload: GameMessagePayload | GameScoreUpdatePayload | GameTeamJoinPayload
  | GameTeamUpdatePayload | GameTeamUserJoinPayload | GameUpdatePayload | GameChallengeUpdatePayload
  context: Context
}

export function filterGame({ payload, args, context }: FilterGameSubscriptionAgrs): boolean {
  const filterGameId = args.where?.id ?? context.auth.gameId;
  const payloadGameId = 'gameId' in payload ? payload.gameId : payload.id;

  return filterGameId === payloadGameId;
}