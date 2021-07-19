import { PrismaClient, Prisma, User as PrismaUser, HintReveal } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Container } from 'typedi';
import { UserRole } from '../enums';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { Team } from './Team';
import { Attempt } from './Attempt';

const prisma = Container.get(PrismaClient);

@ObjectType()
export class User extends FromPrisma<PrismaUser> implements PrismaUser {
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
  @PrismaRelation(() => Game)
  game: Game
  gameId: string

  @PrismaRelation(() => Team)
  team: Team
  teamId: string

  @Field(() => Team, { name: 'team' })
  async fetchTeam(): Promise<Team> {
    if (!this.team) {
      this.team = new Team(
        await Container.get(PrismaClient).team.findUnique({ where: { id: this.teamId } }),
      );
    }
    return this.team;
  }


  @PrismaRelation(() => [Attempt])
  attempts: Attempt[]

  hintReveals: HintReveal[]

  toPrismaWhere(): Prisma.UserWhereUniqueInput {
    return { username_gameId: { username: this.username, gameId: this.gameId } };
  }

  /**
   * Deletes all the user's solves and hints, and unwinds their point impact.
   */
  async resetProgress(): Promise<void> {
    const where = { user: { id: this.id }, team: { id: this.teamId } };
    // eslint-disable-next-line no-underscore-dangle
    const previousPoints = (await prisma.attempt.aggregate({ _sum: { pointsEarned: true }, where }))
      ._sum.pointsEarned || 0;
    // eslint-disable-next-line no-underscore-dangle
    const previousPenalties = (await prisma.hintReveal.aggregate({ _sum: { pointsCost: true }, where }))
      ._sum.pointsCost || 0;
    await prisma.team.update({
      where: { id: this.teamId },
      data: { points: { increment: previousPenalties - previousPoints } },
    });
    await prisma.attempt.deleteMany({ where });
    this.attempts = [];
    await prisma.hintReveal.deleteMany({ where });
    this.hintReveals = [];
  }

  /**
   * Finds the user record for a given username and game ID.
   */
  static async fromUsernameAndGameId(
    username: string,
    gameId: string,
    include?: Prisma.UserInclude | undefined,
  ): Promise<User | null> {
    return new User(await prisma.user.findUnique({
      where: { username_gameId: { username, gameId } },
      include: include || {
        game: true,
        team: true,
        attempts: true,
        hintReveals: true,
      },
    }));
  }
}
