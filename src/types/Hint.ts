import { Hint as PrismaHint, PrismaClient } from '@prisma/client';
import { ObjectType, Field, Ctx, Arg } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Challenge } from './Challenge';
import { FindOneGameSlugOrIdInput } from '~/inputs';
import { Context } from '~/context';
import { AdminOnlyArg, RequireUserOrArg } from '~/middleware';
import { RequireVisible } from '~/middleware';
import Container from 'typedi';

@ObjectType()
export class Hint extends FromPrisma<PrismaHint> implements PrismaHint {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String, { nullable: true })
  @RequireVisible(null, 'isRevealed')
  text: string

  @Field(() => Date, { nullable: true })
  availableAt: Date | null

  @Field(() => Number, { nullable: true })
  penalty: number | null

  // Relations
  @PrismaRelation(() => Game)
  game: Game
  gameId: string

  @PrismaRelation(() => Challenge)
  challenge: Challenge
  challengeId: string

  @Field(() => Boolean)
  @RequireUserOrArg('team')
  @AdminOnlyArg('team')
  async isRevealed(
    @Ctx() { auth }: Context,
    @Arg('team', () => FindOneGameSlugOrIdInput, { nullable: true }) team?: FindOneGameSlugOrIdInput,
  ): Promise<boolean> {
    const reveals = await Container.get(PrismaClient).hintReveal.count({
      where: {
        ...(auth.isAdmin && team ? { team } : { team: { id: auth.teamId! } }),
        hint: { id: this.id },
      }
    });
    return reveals > 0;
  }
}
