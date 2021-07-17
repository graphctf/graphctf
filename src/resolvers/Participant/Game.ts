import { Resolver, Query, Subscription, Arg, Ctx, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Game, Team, ScoreboardEntry } from '~/types';
import { GameTopics, GameTopicPayload, filterGame as filter } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';
import { Context } from '~/context';

@Service()
@Resolver(() => Game)
export class GameResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Subscription(() => Game, { name: 'game', topics: GameTopics.GAME, filter, nullable: true })
  async gameSubscription(
    @Root() { _del }: GameTopicPayload,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Game | null> {
    if (_del) return null;
    return new Game(
      await this.prisma.game.findFirst({ where })
    );
  }

  @Query(() => [ScoreboardEntry])
  async scores(
    @Ctx() { auth }: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<ScoreboardEntry[]> {
    const teams = Team.FromArray(
      await this.prisma.team.findMany({
        where: { game: auth.isAdmin ? where : { id: auth.gameId! }, points: { gt: 0 } },
        orderBy: { points: 'desc' },
        include: {
          attempts: {
            where: { correct: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })
    );
    return teams
      .sort((a, b) => {
        // By default sort by highest points
        if (a.points !== b.points) return a.points > b.points ? -1 : 1;
        // If two teams have the same points, sort whoever got there first higher
        return a.attempts[0].createdAt.getTime() < b.attempts[0].createdAt.getTime() ? -1 : 1;
      })
      .map(({ attempts, ...team }, ranking) => ({
        ranking,
        team: { ...team, attempts: null },
        teamId: team.id,
      }));
  }

  @Subscription(() => [ScoreboardEntry], { name: 'scores', topics: GameTopics.SCORES, filter })
  async scoresSubscription(
    @Root() { _del }: GameTopicPayload,
    @Ctx() ctx: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<ScoreboardEntry[]> {
    if (_del) return [];
    return this.scores(ctx, where);
  }
}
