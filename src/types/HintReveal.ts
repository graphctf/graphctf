import { HintReveal as PrismaHintReveal } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Team } from './Team';
import { User } from './User';
import { Challenge } from './Challenge';
import { Hint } from './Hint';

@ObjectType()
export class HintReveal extends FromPrisma<PrismaHintReveal> implements PrismaHintReveal {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => Number, { nullable: true })
  pointsCost: number | null

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

  @PrismaRelation(() => Hint)
  @Field(() => Hint)
  hint: Hint

  hintId: string
}
