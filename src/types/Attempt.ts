import { Attempt as PrismaAttempt, PrismaClient } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import Container from 'typedi';
import { RequireMemberOfTeam } from '~/context';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Team } from './Team';
import { User } from './User';
import { Challenge } from './Challenge';

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
  game: Game
  gameId: string

  @PrismaRelation(() => Team)
  team: Team
  teamId: string

  @Field(() => Team)
  async fetchTeam(): Promise<Team> {
    if (!this.team) {
      this.team = new Team(await Container.get(PrismaClient).team.findUnique({ where: { id: this.teamId } }));
    }
    return this.team;
  }

  @PrismaRelation(() => User)
  user: User
  userId: string

  @Field(() => User)
  async fetchUser(): Promise<User> {
    if (!this.user) {
      this.user = new User(await Container.get(PrismaClient).user.findUnique({ where: { id: this.userId } }));
    }
    return this.user;
  }

  @PrismaRelation(() => Challenge)
  challenge: Challenge
  challengeId: string

  @Field(() => Challenge)
  async fetchChallenge(): Promise<Challenge> {
    if (!this.challenge) {
      this.challenge = new Challenge(
        await Container.get(PrismaClient).challenge.findUnique({ where: { id: this.challengeId } })
      );
    }
    return this.challenge;
  }
}
