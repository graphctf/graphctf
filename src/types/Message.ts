import { Message as PrismaMessage } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Game } from './Game';

@ObjectType()
export class Message implements PrismaMessage {
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
  @Field(() => Game)
  game: Game

  gameId: string
}
