import { Attempt as PrismaAttempt } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Team } from './Team';
import { User } from './User';
import { Challenge } from './Challenge';

@ObjectType()
export class Attempt extends FromPrisma<PrismaAttempt> implements PrismaAttempt {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String, { nullable: true })
  submission: string | null

  @Field(() => Boolean, { nullable: true })
  correct: boolean | null

  @Field(() => Number, { nullable: true })
  pointsEarned: number | null

  @Field(() => Boolean, { defaultValue: false })
  reviewRequired: boolean

  @Field(() => Boolean, { defaultValue: false })
  reviewCompleted: boolean

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string

  @PrismaRelation(() => Team)
  @Field(() => Team)
  team: Team

  teamId: string

  @PrismaRelation(() => User)
  @Field(() => User)
  user: User

  userId: string

  @PrismaRelation(() => Challenge)
  @Field(() => Challenge)
  challenge: Challenge

  challengeId: string
}
