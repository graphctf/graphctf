import { PrismaClient, Team as PrismaTeam } from '@prisma/client';
import { ObjectType, Field, Authorized } from 'type-graphql';
import { Container } from 'typedi';
import { AuthRequirement } from '~/context';
import { FromPrisma, PrismaRelation } from './FromPrisma';
import { Game } from './Game';
import { User } from './User';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';

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

  // TODO(@tylermenezes): AdminOrMyTeam
  @Authorized(AuthRequirement.ADMIN)
  @Field(() => String)
  code: string

  // Relations
  @PrismaRelation(() => Game)
  game: Game | null

  @Field(() => Game, { name: 'game' })
  async fetchGame(): Promise<Game> {
    if (!this.game) {
      this.game = new Game(await Container.get(PrismaClient).game.findUnique({ where: { id: this.gameId } }));
    }
    return this.game;
  }

  gameId: string

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

  @Field(() => [Attempt], { name: 'attempts' })
  async fetchAttempts(): Promise<Attempt[]> {
    if (this.attempts === null) {
      this.attempts = Attempt.FromArray(await Container.get(PrismaClient).attempt.findMany({
        where: { teamId: this.id },
      }));
    }
    return this.attempts;
  }


  @PrismaRelation(() => [HintReveal])
  hintReveals: HintReveal[] | null

  @Field(() => [HintReveal], { name: 'hintReveals' })
  async fetchHintReveals(): Promise<HintReveal[]> {
    if (this.hintReveals === null) {
      this.hintReveals = HintReveal.FromArray(await Container.get(PrismaClient).hintReveal.findMany({
        where: { teamId: this.id },
      }));
    }
    return this.hintReveals;
  }
}
