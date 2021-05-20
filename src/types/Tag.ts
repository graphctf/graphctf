import { Tag as PrismaTag } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Challenge } from './Challenge';

@ObjectType()
export class Tag extends FromPrisma<PrismaTag> implements PrismaTag {
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

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string

  @PrismaRelation(() => [Challenge])
  @Field(() => [Challenge])
  challenges: Challenge[]
}
