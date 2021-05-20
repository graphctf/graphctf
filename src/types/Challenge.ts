import { Challenge as PrismaChallenge } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { ChallengeScoringType } from '../enums';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Tag } from './Tag';
import { Solution } from './Solution';
import { Hint } from './Hint';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';

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
  @Field(() => String)
  slug: string

  @Field(() => String)
  title: string

  @Field(() => String)
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
  pointsEndAt: Date

  @Field(() => Number)
  pointsEndSolveCount: number

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string

  @PrismaRelation(() => Challenge)
  @Field(() => Challenge, { nullable: true })
  requiresChallenge: Challenge | null

  requiresChallengeId: string | null

  @PrismaRelation(() => [Challenge])
  @Field(() => [Challenge])
  requiredBy: Challenge[]

  @PrismaRelation(() => [Tag])
  @Field(() => [Tag])
  tags: Tag[]

  @PrismaRelation(() => [Solution])
  @Field(() => [Solution])
  solutions: Solution[]

  @PrismaRelation(() => [Hint])
  @Field(() => [Hint])
  hints: Hint[]

  @PrismaRelation(() => [HintReveal])
  @Field(() => [HintReveal])
  hintReveals: HintReveal[]

  @PrismaRelation(() => [Attempt])
  @Field(() => [Attempt])
  attempts: Attempt[]
}
