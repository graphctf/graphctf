import { PrismaClient, Tag as PrismaTag } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import Container from 'typedi';
import { RequireMemberOfGame } from '~/context';
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
  game: Game
  gameId: string

  @PrismaRelation(() => [Challenge])
  challenges: Challenge[]

  @Field(() => [Challenge])
  @RequireMemberOfGame()
  async fetchChallenges(): Promise<Challenge[]> {
    if (!this.challenges) {
      this.challenges = Challenge.FromArray(
        await Container.get(PrismaClient).challenge.findMany({ where: { game: { id: this.id } } })
      );
    }
    return this.challenges;
  }
}
