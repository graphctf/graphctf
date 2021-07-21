import { FindOneGameSlugOrIdInput } from '~/inputs';
import { Context } from '~/context';
import { TeamChallengeAttemptPayload } from './TeamChallengeAttempt';
import { TeamChallengeHintRevealPayload } from './TeamChallengeHintReveal';
import { TeamUpdatePayload } from './TeamUpdate';
import { TeamUserJoinPayload } from './TeamUserJoin';

export interface TeamSubscriptionArgs {
  where?: FindOneGameSlugOrIdInput
}

export interface FilterTeamSubscriptionArgs {
  args: TeamSubscriptionArgs
  payload: TeamChallengeAttemptPayload | TeamChallengeHintRevealPayload | TeamUpdatePayload | TeamUserJoinPayload
  context: Context
}

export function filterTeam({ args, payload, context }: FilterTeamSubscriptionArgs): boolean {
  const payloadTeamId = 'teamId' in payload ? payload.teamId : payload.id;
  const payloadTeamSlug = 'teamId' in payload ? payload.team.slug : payload.slug;
  const payloadGameId = payload.gameId;

  if (args.where?.slug) {
    return payloadTeamSlug === args.where.slug && payloadGameId === args.where.gameId;
  } else {
    const filterTeamId = args.where?.id ?? context.auth.teamId;
    return filterTeamId === payloadTeamId;
  }
}
