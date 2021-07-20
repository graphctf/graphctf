import { Game as PrismaGame, Prisma, PrismaClient } from '@prisma/client';
import { ObjectType, Field, Ctx, Arg } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Context } from '~/context';
import { RequireMemberOfGame, RequireAdmin, AdminOnlyArg, RequireUserOrArg, ResolveIfMissing } from '~/middleware';
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
  @Field(() => [User])
  @RequireMemberOfGame()
  @ResolveIfMissing('user', ['gameId'])
  users: User[]

  @PrismaRelation(() => [Team])
  @Field(() => [Team])
  @RequireMemberOfGame()
  @ResolveIfMissing('team', ['gameId'])
  teams: Team[]

  @PrismaRelation(() => [Challenge])
  @Field(() => [Challenge])
  @RequireMemberOfGame()
  @ResolveIfMissing('challenge', ['gameId'])
  challenges: Challenge[]

  @PrismaRelation(() => [Message])
  @Field(() => [Message])
  @RequireMemberOfGame()
  @ResolveIfMissing('message', ['gameId'])
  messages: Message[]

  @PrismaRelation(() => [Tag])
  @Field(() => [Tag])
  @RequireMemberOfGame()
  @ResolveIfMissing('tag', ['gameId'])
  tags: Tag[]

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
