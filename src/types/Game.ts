import { Game as PrismaGame, Prisma, PrismaClient } from '@prisma/client';
import { ObjectType, Field, Ctx, Arg } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Context, RequireMemberOfGame, RequireAdmin, AdminOnlyArg, RequireUserOrArg } from '~/context';
import { User } from './User';
import { Team } from './Team';
import { Challenge } from './Challenge';
import { Hint } from './Hint';
import { Attempt } from './Attempt';
import { Message } from './Message';
import { Tag } from './Tag';
import { Solution } from './Solution';
import { FindOneIdInput } from '~/inputs';
import Container from 'typedi';

@ObjectType()
export class Game extends FromPrisma<PrismaGame> implements PrismaGame {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => Boolean)
  @RequireUserOrArg('team')
  @AdminOnlyArg('team')
  async isVisible(
    @Ctx() ctx: Context,
    @Arg('team', () => FindOneIdInput, { nullable: true }) team?: FindOneIdInput,
  ): Promise<boolean> {
    const now = new Date();
    if (this.startsAt && this.startsAt.getTime() > now.getTime()) return false;
    if (this.endsAt && this.endsAt.getTime() < now.getTime()) return false;
    return true;
  }

  @Field(() => String)
  name: string

  @Field(() => Date)
  visibleAt: Date

  @Field(() => Date)
  startsAt: Date

  @Field(() => Date)
  endsAt: Date

  @Field(() => Date)
  hiddenAt: Date

  // Relations
  @PrismaRelation(() => [User])
  users: User[]

  @Field(() => [User])
  @RequireMemberOfGame()
  async fetchUsers(): Promise<User[]> {
    if (!this.users) {
      this.users = User.FromArray(
        await Container.get(PrismaClient).user.findMany({ where: { game: { id: this.id } } })
      );
    }
    return this.users;
  }

  @PrismaRelation(() => [Team])
  teams: Team[]

  @Field(() => [Team])
  @RequireMemberOfGame()
  async fetchTeams(): Promise<Team[]> {
    if (!this.teams) {
      this.teams = Team.FromArray(
        await Container.get(PrismaClient).team.findMany({ where: { game: { id: this.id } } })
      );
    }
    return this.teams;
  }

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

  @PrismaRelation(() => [Message])
  messages: Message[]

  @Field(() => [Message])
  @RequireMemberOfGame()
  async fetchMessages(): Promise<Message[]> {
    if (!this.tags) {
      this.messages = Message.FromArray(
        await Container.get(PrismaClient).message.findMany({ where: { game: { id: this.id } } })
      );
    }
    return this.messages;
  }

  @PrismaRelation(() => [Tag])
  tags: Tag[]

  @Field(() => [Tag])
  @RequireMemberOfGame()
  async fetchTags(): Promise<Tag[]> {
    if (!this.tags) {
      this.tags = Tag.FromArray(
        await Container.get(PrismaClient).tag.findMany({ where: { game: { id: this.id } } })
      );
    }
    return this.tags;
  }


  @PrismaRelation(() => [Hint])
  hints: Hint[]

  @PrismaRelation(() => [Attempt])
  attempts: Attempt[]

  @PrismaRelation(() => [Solution])
  solutions: Solution[]

  static getDefaultInclude({ auth }: Context): Prisma.GameInclude {
    if (auth.isAdmin) {
      return {
        users: true,
        teams: true,
        tags: { include: { challenges: true } },
        hints: true,
        attempts: true,
        hintReveals: true,
        messages: true,
        solutions: true,
      };
    }

    const showOnlyGame = auth.isUser ? { where: { game: { id: auth.gameId! } } } : false;
    const showOnlyTeam = auth.isUser ? { where: { team: { id: auth.teamId! } } } : false;

    return {
      users: showOnlyGame,
      teams: showOnlyGame,
      tags: { include: { challenges: true } },
      challenges: true,
      hints: showOnlyGame,
      attempts: showOnlyTeam,
      hintReveals: showOnlyTeam,
      messages: showOnlyGame,
      solutions: false,
    };
  }
}
