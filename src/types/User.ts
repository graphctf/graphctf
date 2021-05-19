import { User as PrismaUser } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { UserRole } from '../enums';
import { Game } from './Game';
import { Team } from './Team';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';

@ObjectType()
export class User implements PrismaUser {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String)
  username: string

  @Field(() => UserRole)
  role: UserRole

  // Relations
  @Field(() => Game)
  game: Game

  gameId: string

  @Field(() => Team)
  team: Team

  teamId: string

  @Field(() => [Attempt])
  attempts: [Attempt]

  @Field(() => [HintReveal])
  hintReveals: [HintReveal]
}
