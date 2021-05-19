import { Challenge as PrismaChallenge } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { ChallengeScoringType } from '../enums';
import { Game } from './Game';
import { Tag } from './Tag';
import { Solution } from './Solution';
import { Hint } from './Hint';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';

@ObjectType()
export class Challenge implements PrismaChallenge {
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
  @Field(() => Game)
  game: Game

  gameId: string

  @Field(() => Challenge, { nullable: true })
  requiresChallenge: Challenge | null

  requiresChallengeId: string | null

  @Field(() => [Challenge])
  requiredBy: Challenge[]

  @Field(() => [Tag])
  tags: Tag[]

  @Field(() => [Solution])
  solutions: Solution[]

  @Field(() => [Hint])
  hints: Hint[]

  @Field(() => [HintReveal])
  hintReveals: HintReveal[]

  @Field(() => [Attempt])
  attempts: Attempt[]
}
