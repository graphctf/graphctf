import { Solution as PrismaSolution } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { SolutionType } from '../enums';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Challenge } from './Challenge';

@ObjectType()
export class Solution extends FromPrisma<PrismaSolution> implements PrismaSolution {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String)
  text: string

  @Field(() => SolutionType)
  type: SolutionType

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string

  @PrismaRelation(() => Challenge)
  @Field(() => Challenge)
  challenge: Challenge

  challengeId: string
}
