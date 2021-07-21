import { HintReveal, Team as PrismaTeam } from '@prisma/client';
import { ObjectType, Field, Authorized } from 'type-graphql';
import { RequireCaptainOfTeam, RequireMemberOfTeam } from '~/middleware';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { User } from './User';
import { Attempt } from './Attempt';
import { ResolveIfMissing } from '../middleware';

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

  @Field(() => String)
  @RequireCaptainOfTeam()
  code: string

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  @ResolveIfMissing('game', 'gameId')
  game: Game | null
  gameId: string

  @PrismaRelation(() => [User])
  @Field(() => [User])
  @ResolveIfMissing('user', ['teamId'])
  users: User[] | null

  @PrismaRelation(() => [Attempt])
  @Field(() => [Attempt])
  @RequireMemberOfTeam()
  @ResolveIfMissing('attempt', ['teamId'])
  attempts: Attempt[] | null

  hintReveals: HintReveal[] | null
}
