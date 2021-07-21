import {
  Resolver, Query, Mutation, Arg, Ctx, PubSub, Publisher
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject, Service } from 'typedi';
import { Game } from '~/types';
import { CreateGameInput, EditGameInput, FindOneIdInput } from '~/inputs';
import { Context } from '~/context';
import { RequireAdmin } from '~/middleware';
import { GameUpdateTopic, GameUpdatePayload } from '~/subscriptions';

@Service()
@Resolver(Game)
export class AdminGameResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => [Game])
  @RequireAdmin()
  async games(
    @Ctx() context: Context,
  ): Promise<Game[]> {
    return Game.FromArray(await this.prisma.game.findMany({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      where: context.auth.isUser ? { id: context.auth.gameId! } : {},
      include: Game.getDefaultInclude(context),
    }));
  }

  @Mutation(() => Game)
  @RequireAdmin()
  async createGame(
    @Arg('data', () => CreateGameInput) data: CreateGameInput,
  ): Promise<Game> {
    const game = await this.prisma.game.create({
      data,
    });
    return new Game(game);
  }

  @Mutation(() => Game)
  @RequireAdmin()
  async editGame(
    @Ctx() context: Context,
    @PubSub(GameUpdateTopic) publish: Publisher<GameUpdatePayload>,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
    @Arg('data', () => EditGameInput) data: EditGameInput,
  ): Promise<Game> {
    const game = await this.prisma.game.update({
      where,
      data,
      include: Game.getDefaultInclude(context),
    });
    publish(game);
    return new Game(game);
  }

  @Mutation(() => Boolean)
  @RequireAdmin()
  async deleteGame(
    @PubSub(GameUpdateTopic) publish: Publisher<GameUpdatePayload>,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<boolean> {
    const game = await this.prisma.game.findUnique({ where });
    if (!game) throw Error('Game not found.');
    
    await Promise.all([
      this.prisma.attempt.deleteMany({ where: { game: where } }),
      this.prisma.hintReveal.deleteMany({ where: { game: where } }),
      this.prisma.message.deleteMany({ where: { game: where } }),
      this.prisma.tag.deleteMany({ where: { game: where } }),
    ]);
    await Promise.all([
      this.prisma.hint.deleteMany({ where: { game: where } }),
      this.prisma.solution.deleteMany({ where: { game: where } }),
    ]);
    await Promise.all([
      this.prisma.challenge.deleteMany({ where: { game: where } }),
      this.prisma.user.deleteMany({ where: { game: where } }),
    ]);
    await this.prisma.team.deleteMany({ where: { game: where } });
    await this.prisma.game.delete({ where });

    publish({ ...game, __deleted: true });
    return true;
  }
}
