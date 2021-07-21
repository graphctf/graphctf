import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Team } from '~/types';
import { GameTeamJoinTopic, GameTeamJoinPayload, filterGame } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';

@Service()
@Resolver(() => Team)
export class ParticipantTeamResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;
  @Subscription(() => Team, { name: 'teams', topics: GameTeamJoinTopic, filter: filterGame })
  async teamsSubscription(
    @Root() payload: GameTeamJoinPayload,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Team> {
    return new Team(payload);
  }
}
