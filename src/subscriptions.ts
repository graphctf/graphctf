import { ResolverFilterData } from 'type-graphql';
import { Context } from '~/context';
import { FindOneIdInput, FindOneGameSlugOrIdInput } from '~/inputs';
import { NoExtraProperties } from '~/utils';

export enum GameTopics {
  GAME = "GAME",
  CHALLENGES = "GAME_CHALLENGES",
  MESSAGES = "GAME_MESSAGES",
  TEAMS = "GAME_TEAMS",
  SCORES = "GAME_SCORES",
}

export enum TeamTopics {
  TEAM = "GAME_TEAM",
  MEMBERS = "GAME_TEAM_MEMBERS",
  SOLVES = "GAME_TEAM_SOLVES",
  HINT_REVEALS = "GAME_TEAM_HINT_REVEALS",
}

// All events will just pass the filter ID, rather than the full object from the DB. A few reasons we do this:
//   - Only one extra DB query per emitted event per shard, which is negligable compared to the polling other CTF
//     software use for updates.
//   - Shards coordinate to emit subscription messages over Redis; the latency this introduces could cause events
//     to be out-of-date.
//   - Code is much simpler.
//
// This won't work well if there are lots of events emitted (which is why we don't have e.g. an `attempt` event).

export type GameTopicPayload = NoExtraProperties<{
  game: { id: string }
  _del?: true
}>;

export type GameTopicFilter<TArgs = { where: FindOneIdInput }> =
  ResolverFilterData<GameTopicPayload, TArgs, Context>;

export function filterGame({ payload, args }: GameTopicFilter) {
  return payload.game.id === args.where.id;
}

export type TeamTopicPayload = NoExtraProperties<{
  game: { id: string }
  team: { id: string, slug: string }
  _del?: true
}>

export type TeamTopicFilter<TArgs = { where: FindOneGameSlugOrIdInput }> =
  ResolverFilterData<TeamTopicPayload, TArgs, Context>;

export function filterTeam({ payload, args }: TeamTopicFilter) {
  return args.where.id
    ? payload.team.id === args.where.id
    : (payload.game.id === args.where.gameId && payload.team.slug === args.where.slug);
}
