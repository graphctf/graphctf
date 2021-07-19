import { Challenge as PrismaChallenge, HintReveal, Prisma, PrismaClient } from '@prisma/client';
import { ObjectType, Field, Ctx, Arg } from 'type-graphql';
import { ChallengeScoringType } from '../enums';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Tag } from './Tag';
import { Solution } from './Solution';
import { Hint } from './Hint';
import { Attempt } from './Attempt';
import Container from 'typedi';
import { RequireAdmin, Context, RequireUserOrArg, AdminOnlyArg } from '~/context';
import { FindOneGameSlugOrIdInput } from '~/inputs';
import { RequireVisible } from '~/middleware';

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
      const requirement = await this.fetchRequiresChallenge();
      if (requirement && !await requirement.isSolved(ctx, team)) return false;
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
  game: Game
  gameId: string

  @PrismaRelation(() => Challenge)
  requiresChallenge: Challenge | null
  requiresChallengeId: string | null

  @Field(() => Challenge, { nullable: true, name: 'requiresChallenge' })
  async fetchRequiresChallenge(): Promise<Challenge | null> {
    if (!this.requiresChallenge && this.requiresChallengeId) {
      this.requiresChallenge = new Challenge(
        await Container.get(PrismaClient).challenge.findUnique({ where: { id: this.requiresChallengeId } })
      );
    }

    return this.requiresChallenge;
  }

  @PrismaRelation(() => [Challenge])
  requiredBy: Challenge[]

  @Field(() => [Challenge], { name: 'requiredBy' })
  async fetchRequiredBy(): Promise<Challenge[]> {
    if (!this.requiredBy) {
      this.requiredBy = Challenge.FromArray(
        await Container.get(PrismaClient).challenge.findMany({ where: { requiresChallenge: { id: this.id } } })
      );
    }
    return this.requiredBy;
  }

  @PrismaRelation(() => [Tag])
  tags: Tag[]

  @Field(() => [Tag], { name: 'tags' })
  async fetchTags(): Promise<Tag[]> {
    if (!this.tags) {
      this.tags = Tag.FromArray(
        await Container.get(PrismaClient).tag.findMany({ where: { challenges: { some: { id: this.id } } } })
      );
    }
    return this.tags;
  }


  @PrismaRelation(() => [Solution])
  solutions: Solution[]

  @Field(() => [Solution], { name: 'solution' })
  @RequireAdmin()
  async fetchSolutions(): Promise<Solution[]> {
    if (!this.solutions) {
      this.solutions = Solution.FromArray(
        await Container.get(PrismaClient).solution.findMany({ where: { challenge: { id: this.id } } })
      );
    }
    return this.solutions;
  }

  @PrismaRelation(() => [Hint])
  hints: Hint[]

  @Field(() => [Hint], { name: 'hints' })
  async fetchHints(): Promise<Hint[]> {
    if (!this.hints) {
      this.hints = Hint.FromArray(
        await Container.get(PrismaClient).hint.findMany({ where: { challenge: { id: this.id } } })
      );
    }
    return this.hints;
  }

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
