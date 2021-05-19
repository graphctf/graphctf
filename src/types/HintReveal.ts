import { HintReveal as PrismaHintReveal } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Game } from './Game';
import { Team } from './Team';
import { User } from './User';
import { Challenge } from './Challenge';
import { Hint } from './Hint';

@ObjectType()
export class HintReveal implements PrismaHintReveal {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => Number, { nullable: true })
  pointsCost?: number

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

  @Field(() => Hint)
  hint: Hint

  hintId: string
}
