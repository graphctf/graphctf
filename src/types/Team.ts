import { Team as PrismaTeam } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Game } from './Game';
import { User } from './User';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';

@ObjectType()
export class Team implements PrismaTeam {
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
  name: string

  @Field(() => Number, { defaultValue: 0 })
  points: number

  // Relations
  @Field(() => Game)
  game: Game

  gameId: string

  @Field(() => [User])
  users: [User]

  @Field(() => [Attempt])
  attempts: [Attempt]

  @Field(() => [HintReveal])
  hintReveals: [HintReveal]
}
