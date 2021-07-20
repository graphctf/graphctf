import { Attempt as PrismaAttempt, PrismaClient } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import Container from 'typedi';
import { RequireMemberOfTeam, ResolveIfMissing } from '~/middleware';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Team } from './Team';
import { User } from './User';
import { Challenge } from './Challenge';
import { resolve } from 'path/posix';

@ObjectType()
export class Attempt extends FromPrisma<PrismaAttempt> implements PrismaAttempt {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String, { nullable: true })
  @RequireMemberOfTeam()
  submission: string | null

  @Field(() => Boolean, { nullable: true })
  @RequireMemberOfTeam()
  correct: boolean | null

  @Field(() => Number, { nullable: true })
  @RequireMemberOfTeam()
  pointsEarned: number | null

  @Field(() => Boolean, { defaultValue: false })
  @RequireMemberOfTeam()
  reviewRequired: boolean

  @Field(() => Boolean, { defaultValue: false })
  @RequireMemberOfTeam()
  reviewCompleted: boolean

  // Relations
  @PrismaRelation(() => Game)
  @Field(() => Game)
  @ResolveIfMissing('game', 'gameId')
  game: Game
  gameId: string

  @PrismaRelation(() => Team)
  @Field(() => Team)
  @ResolveIfMissing('team', 'teamId')
  team: Team
  teamId: string

  @PrismaRelation(() => User)
  @Field(() => User)
  @ResolveIfMissing('user', 'userId')
  user: User
  userId: string

  @PrismaRelation(() => Challenge)
  @Field(() => Challenge)
  @ResolveIfMissing('challenge', 'challengeId')
  challenge: Challenge
  challengeId: string
}
