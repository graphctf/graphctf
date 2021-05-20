import { Team as PrismaTeam } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { User } from './User';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';

@ObjectType()
export class Team extends FromPrisma<PrismaTeam> implements PrismaTeam {
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
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string

  @PrismaRelation(() => [User])
  @Field(() => [User])
  users: [User]

  @PrismaRelation(() => [Attempt])
  @Field(() => [Attempt])
  attempts: [Attempt]

  @PrismaRelation(() => [HintReveal])
  @Field(() => [HintReveal])
  hintReveals: [HintReveal]
}
