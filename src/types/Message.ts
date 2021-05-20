import { Message as PrismaMessage } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';

@ObjectType()
export class Message extends FromPrisma<PrismaMessage> implements PrismaMessage {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String)
  title: string

  @Field(() => String)
  content: string

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  game: Game

  gameId: string
}
