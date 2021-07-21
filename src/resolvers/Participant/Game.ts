import { Resolver, Query, Subscription, Arg, Ctx, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Game, Team, Scoreboard } from '~/types';
import { FindOneIdInput } from '~/inputs';
import { Context } from '~/context';
import {
  GameUpdateTopic,
  GameUpdatePayload,
  GameScoreUpdateTopic,
  GameScoreUpdatePayload,
  filterGame
} from '~/subscriptions';
import { RequireUserOrArg, AdminOnlyArg } from '~/middleware';

@Service()
@Resolver(() => Game)
export class ParticipantGameResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => Game, { nullable: true })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
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

  @Subscription(() => Game, { name: 'game', topics: GameUpdateTopic, filter: filterGame })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async gameSubscription(
    @Root() payload: GameUpdatePayload,
    @Ctx() ctx: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Game | null> {
    return new Game(payload);
  }

  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  @Query(() => Scoreboard)
  async scores(
    @Ctx() { auth }: Context,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Scoreboard> {
    const game = await this.prisma.game.findUnique({ where: where || { id: auth.gameId! } });
    if (!game) throw Error('Game not found.');
    const scoreboard = new Scoreboard();
    scoreboard.gameId = game.id;
    scoreboard.game = new Game(game);
    return scoreboard;
  }

  @Subscription(() => Scoreboard, { name: 'scores', topics: GameScoreUpdateTopic, filter: filterGame })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async scoresSubscription(
    @Root() scoreboard: GameScoreUpdatePayload,
    @Ctx() ctx: Context,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Scoreboard> {
    return scoreboard;
  }
}
