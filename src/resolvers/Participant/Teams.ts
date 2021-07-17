import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Team } from '~/types';
import { GameTopics, GameTopicPayload, filterGame as filter } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';

@Service()
@Resolver(() => Team)
export class TeamResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;
  @Subscription(() => [Team], { name: 'teams', topics: GameTopics.TEAMS, filter })
  async teamsSubscription(
    @Root() { _del }: GameTopicPayload,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Team[]> {
    if (_del) return [];
    return Team.FromArray(
      await this.prisma.team.findMany({ where: { game: where } })
    );
  }
}
