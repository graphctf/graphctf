import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Team } from '~/types';
import { GameTeamJoinTopic, GameTeamJoinPayload, filterGame } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';
import { AdminOnlyArg, RequireUserOrArg } from '~/middleware';

@Service()
@Resolver(() => Team)
export class ParticipantTeamResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Subscription(() => Team, { name: 'teams', topics: GameTeamJoinTopic, filter: filterGame })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async teamsSubscription(
    @Root() payload: GameTeamJoinPayload,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Team> {
    return new Team(payload);
  }
}
