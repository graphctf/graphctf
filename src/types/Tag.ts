import { Tag as PrismaTag } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Game } from './Game';
import { Challenge } from './Challenge';

@ObjectType()
export class Tag implements PrismaTag {
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
  @Field(() => Game)
  game: Game

  gameId: string

  @Field(() => [Challenge])
  challenges: Challenge[]
}
