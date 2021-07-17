import { Game as PrismaGame, Prisma } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Context } from '~/context';
import { User } from './User';
import { Team } from './Team';
import { Challenge } from './Challenge';
import { Hint } from './Hint';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';
import { Message } from './Message';
import { Tag } from './Tag';
import { Solution } from './Solution';

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
  users: User[]

  @PrismaRelation(() => [Team])
  @Field(() => [Team])
  teams: Team[]

  @PrismaRelation(() => [Challenge])
  @Field(() => [Challenge])
  challenges: Challenge[]

  @PrismaRelation(() => [Hint])
  @Field(() => [Hint])
  hints: Hint[]

  @PrismaRelation(() => [Attempt])
  @Field(() => [Attempt])
  attempts: Attempt[]

  @PrismaRelation(() => [HintReveal])
  @Field(() => [HintReveal])
  hintReveals: HintReveal[]

  @PrismaRelation(() => [Message])
  @Field(() => [Message])
  messages: Message[]

  @PrismaRelation(() => [Tag])
  @Field(() => [Tag])
  tags: Tag[]

  @PrismaRelation(() => [Solution])
  @Field(() => [Solution])
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

    const challenges: Prisma.ChallengeWhereInput | boolean = true; // TODO(@tylermenezes)
    const showOnlyGame = auth.isUser ? { where: { game: { id: auth.gameId! } } } : false;
    const showOnlyTeam = auth.isUser ? { where: { team: { id: auth.teamId! } } } : false;

    return {
      users: showOnlyGame,
      teams: showOnlyGame,
      tags: { include: { challenges } },
      challenges,
      hints: showOnlyGame,
      attempts: showOnlyTeam,
      hintReveals: showOnlyTeam,
      messages: showOnlyGame,
      solutions: false,
    };
  }
}
