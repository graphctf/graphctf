import { Attempt as PrismaAttempt } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Game } from './Game';
import { Team } from './Team';
import { User } from './User';
import { Challenge } from './Challenge';

@ObjectType()
export class Attempt implements PrismaAttempt {
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

  @Field(() => Boolean, { defaultValue: false })
  reviewRequired: boolean

  @Field(() => Boolean, { defaultValue: false })
  reviewCompleted: boolean

  // Relations
  @Field(() => Game)
  game: Game

  gameId: string

  @Field(() => Team)
  team: Team

  teamId: string

  @Field(() => User)
  user: User

  userId: string

  @Field(() => Challenge)
  challenge: Challenge

  challengeId: string
}
