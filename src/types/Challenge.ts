import { Challenge as PrismaChallenge, HintReveal, Prisma, PrismaClient } from '@prisma/client';
import { ObjectType, Field, Ctx, Arg } from 'type-graphql';
import Container from 'typedi';
import { Context } from '~/context';
import { ChallengeScoringType } from '~/enums';
import { RequireAdmin, RequireUserOrArg, AdminOnlyArg, ResolveIfMissing } from '~/middleware';
import { FindOneGameSlugOrIdInput } from '~/inputs';
import { RequireVisible } from '~/middleware';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Tag } from './Tag';
import { Solution } from './Solution';
import { Hint } from './Hint';
import { Attempt } from './Attempt';

@ObjectType()
export class Challenge extends FromPrisma<PrismaChallenge> implements PrismaChallenge {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => Boolean)
  @RequireUserOrArg('team')
  @AdminOnlyArg('team')
  async isVisible(
    @Ctx() ctx: Context,
    @Arg('team', () => FindOneGameSlugOrIdInput, { nullable: true }) team?: FindOneGameSlugOrIdInput,
  ): Promise<boolean> {
    const now = new Date();
    if (this.startsAt && this.startsAt.getTime() > now.getTime()) return false;
    if (this.endsAt && this.endsAt.getTime() < now.getTime()) return false;
    if (this.requiresChallengeId) {
      const solvedRequirement = await Container.get(PrismaClient).attempt.count({
        where: { challengeId: this.requiresChallengeId, correct: true, team }
      });
      if (solvedRequirement === 0) return false;
    }
    return true;
  }

  @Field(() => Boolean)
  @RequireUserOrArg('team')
  @AdminOnlyArg('team')
  async isSolved(
    @Ctx() { auth }: Context,
    @Arg('team', () => FindOneGameSlugOrIdInput, { nullable: true }) team?: FindOneGameSlugOrIdInput,
  ): Promise<boolean> {
    return await Container.get(PrismaClient).attempt.count({ where: {
      challenge: { id: this.id },
      correct: true,
      ...(auth.isAdmin && team ? { team } : { team: { id: auth.teamId! } }),
    } }) > 0;
  }

  @Field(() => String)
  slug: string

  @Field(() => String)
  title: string

  @Field(() => String, { nullable: true })
  @RequireVisible(null)
  text: string

  @Field(() => Date, { nullable: true })
  startsAt: Date | null

  @Field(() => Date, { nullable: true })
  endsAt: Date | null

  @Field(() => Boolean, { defaultValue: false })
  allowsMultiUserSolves: boolean

  @Field(() => Boolean, { defaultValue: false })
  evaluatedByOrganizer: boolean

  @Field(() => ChallengeScoringType, { defaultValue: ChallengeScoringType.STATIC })
  scoring: ChallengeScoringType

  @Field(() => Number)
  points: number

  @Field(() => Number)
  pointsEnd: number

  @Field(() => Date)
  pointsStartAt: Date

  @Field(() => Date)
  pointsEndAt: Date

  @Field(() => Number)
  pointsEndSolveCount: number

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  @ResolveIfMissing('game', 'gameId')
  game: Game
  gameId: string

  @PrismaRelation(() => Challenge)
  @Field(() => Challenge, { nullable: true })
  @ResolveIfMissing('challenge', 'requiresChallengeId')
  requiresChallenge: Challenge | null
  requiresChallengeId: string | null

  @PrismaRelation(() => [Challenge])
  @Field(() => [Challenge])
  @ResolveIfMissing('challenge', ['requiresChallengeId'])
  requiredBy: Challenge[]

  @PrismaRelation(() => [Tag])
  @Field(() => [Tag])
  @ResolveIfMissing('tag', { many(self) { return { where: { challenges: { some: { id: self.id } } } }; } })
  tags: Tag[]

  @PrismaRelation(() => [Solution])
  @Field(() => [Solution])
  @RequireAdmin()
  @ResolveIfMissing('solution', ['challengeId'])
  solutions: Solution[]

  @PrismaRelation(() => [Hint])
  @Field(() => [Hint])
  @ResolveIfMissing('hint', ['challengeId'])
  hints: Hint[]

  hintReveals: HintReveal[] | null

  @PrismaRelation(() => [Attempt])
  attempts: Attempt[]

  @Field(() => [Attempt], { name: 'attempts' })
  @RequireUserOrArg('team')
  @AdminOnlyArg('team')
  async fetchAttempts(
    @Ctx() { auth }: Context,
    @Arg('team', () => FindOneGameSlugOrIdInput, { nullable: true }) team?: FindOneGameSlugOrIdInput,
    @Arg('correct', () => Boolean, { nullable: true }) correct?: boolean,
  ): Promise<Attempt[]> {
    return Attempt.FromArray(
      await Container.get(PrismaClient).attempt.findMany({ where: {
        challenge: { id: this.id },
        ...(auth.isAdmin && team ? { team } : { team: { id: auth.teamId! } }),
        ...(typeof correct !== 'undefined' && correct !== null ? { correct } : {})
      } })
    );
  }
}
