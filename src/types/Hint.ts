import { Hint as PrismaHint } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Challenge } from './Challenge';
import { HintReveal } from './HintReveal';

export type HintPrismaPartial = Omit<PrismaHint, 'text'> & { text: string | null };

@ObjectType()
export class Hint extends FromPrisma<PrismaHint> implements HintPrismaPartial {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String, { nullable: true })
  text: string | null

  @Field(() => Date, { nullable: true })
  availableAt: Date | null

  @Field(() => Number, { nullable: true })
  penalty: number | null

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string

  @PrismaRelation(() => Challenge)
  @Field(() => Challenge)
  challenge: Challenge

  challengeId: string

  @PrismaRelation(() => [HintReveal])
  @Field(() => [HintReveal])
  hintReveals: HintReveal[]
}
