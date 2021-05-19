import { Hint as PrismaHint } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Game } from './Game';
import { Challenge } from './Challenge';
import { HintReveal } from './HintReveal';

export type HintPrismaPartial = Omit<PrismaHint, 'text'> & { text: string | null };

@ObjectType()
export class Hint implements HintPrismaPartial {
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
  @Field(() => Game)
  game: Game

  gameId: string

  @Field(() => Challenge)
  challenge: Challenge

  challengeId: string

  @Field(() => [HintReveal])
  hintReveals: HintReveal[]
}
