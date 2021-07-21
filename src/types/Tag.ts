import { PrismaClient, Tag as PrismaTag } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import Container from 'typedi';
import { RequireMemberOfGame } from '~/context';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Challenge } from './Challenge';
import { ResolveIfMissing } from '../middleware';

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
  @ResolveIfMissing('game', 'gameId')
  game: Game
  gameId: string

  @PrismaRelation(() => [Challenge])
  @Field(() => [Challenge])
  @ResolveIfMissing('challenge', { many(self) { return { where: { tags: { some: { id: self.id } } } } } })
  challenges: Challenge[]
}
