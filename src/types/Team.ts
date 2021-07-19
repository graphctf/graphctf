import { HintReveal, PrismaClient, Team as PrismaTeam } from '@prisma/client';
import { ObjectType, Field, Authorized } from 'type-graphql';
import { Container } from 'typedi';
import { AuthRequirement, RequireCaptainOfTeam, RequireMemberOfGame, RequireMemberOfTeam } from '~/context';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { User } from './User';
import { Attempt } from './Attempt';

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
  game: Game | null
  gameId: string

  @Field(() => Game, { name: 'game' })
  async fetchGame(): Promise<Game> {
    if (!this.game) {
      this.game = new Game(await Container.get(PrismaClient).game.findUnique({ where: { id: this.gameId } }));
    }
    return this.game;
  }

  @PrismaRelation(() => [User])
  users: User[] | null

  @Field(() => [User], { name: 'users' })
  async fetchUsers(): Promise<User[]> {
    if (this.users === null) {
      this.users = User.FromArray(await Container.get(PrismaClient).user.findMany({
        where: { teamId: this.id },
      }));
    }
    return this.users;
  }

  @PrismaRelation(() => [Attempt])
  attempts: Attempt[] | null

  hintReveals: HintReveal[] | null
}
