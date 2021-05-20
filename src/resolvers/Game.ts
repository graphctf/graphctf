import {
  Resolver, Authorized, Query, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject, Service } from 'typedi';
import { Game } from '../types';
import { CreateEditGameInput, FindOneIdInput } from '../inputs';
import { Context, AuthRequirement } from '../context';

@Service()
@Resolver(Game)
export class GameResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Authorized()
  @Query(() => [Game])
  async games(
    @Ctx() context: Context,
  ): Promise<Game[]> {
    return Game.FromArray(await this.prisma.game.findMany({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      where: context.auth.isUser ? { id: context.auth.gameId! } : {},
      include: Game.getDefaultInclude(context),
    }));
  }

  @Authorized()
  @Query(() => Game, { nullable: true })
  async game(
    @Ctx() context: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Game | null> {
    if (!context.auth.isAdmin && context.auth.gameId !== where.id) return null;

    return new Game(await this.prisma.game.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      where,
      include: Game.getDefaultInclude(context),
    }));
  }

  // Mutations

  @Authorized(AuthRequirement.ADMIN)
  @Mutation(() => Game)
  async createGame(
    @Arg('data', () => CreateEditGameInput) data: CreateEditGameInput,
  ): Promise<Game> {
    return new Game(await this.prisma.game.create({
      data,
    }));
  }

  @Authorized(AuthRequirement.ADMIN)
  @Mutation(() => Game)
  async editGame(
    @Ctx() context: Context,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
    @Arg('data', () => CreateEditGameInput) data: CreateEditGameInput,
  ): Promise<Game> {
    return new Game(await this.prisma.game.update({
      where,
      data,
      include: Game.getDefaultInclude(context),
    }));
  }

  @Authorized(AuthRequirement.ADMIN)
  @Mutation(() => Boolean)
  async deleteGame(
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<boolean> {
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

    return true;
  }
}
