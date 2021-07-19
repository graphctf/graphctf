import { Resolver, Query, Subscription, Arg, Ctx, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Game, Team, ScoreboardEntry } from '~/types';
import { GameTopics, GameTopicPayload, filterGame as filter } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';
import { Context, RequireUserOrArg, ForbidUserArg } from '~/context';

@Service()
@Resolver(() => Game)
export class ParticipantGameResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => Game, { nullable: true })
  @RequireUserOrArg('where')
  @ForbidUserArg('where')
  async game(
    @Ctx() { auth }: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Game | null> {
    const game = await this.prisma.game.findFirst({
      where: auth.isAdmin ? where : { id: auth.gameId! },
    });
    if (!game) return null;
    return new Game(game);
  }

  @Subscription(() => Game, { name: 'game', topics: GameTopics.GAME, filter, nullable: true })
  @RequireUserOrArg('where')
  @ForbidUserArg('where')
  async gameSubscription(
    @Root() { _del }: GameTopicPayload,
    @Ctx() ctx: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Game | null> {
    if (_del) return null;
    return this.game(ctx, where);
  }

  @Query(() => [ScoreboardEntry])
  @RequireUserOrArg('where')
  @ForbidUserArg('where')
  async scores(
    @Ctx() { auth }: Context,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
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
        // This shouldn't ever happen, because you have to have a solution to have points:
        if (!a.attempts || !b.attempts) return 0;
        // If two teams have the same points, sort whoever got there first higher
        return a.attempts[0].createdAt.getTime() < b.attempts[0].createdAt.getTime() ? -1 : 1;
      })
      .map((team) => { team.attempts = null; return team; }) // Remove attempts so it loads all of them later
      .map((team, ranking) => ({
        ranking,
        team,
        teamId: team.id,
      }));
  }

  @Subscription(() => [ScoreboardEntry], { name: 'scores', topics: GameTopics.SCORES, filter })
  @RequireUserOrArg('where')
  @ForbidUserArg('where')
  async scoresSubscription(
    @Root() { _del }: GameTopicPayload,
    @Ctx() ctx: Context,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<ScoreboardEntry[]> {
    if (_del) return [];
    return this.scores(ctx, where);
  }
}
