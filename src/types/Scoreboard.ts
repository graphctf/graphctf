import { PrismaClient, Team } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { Container } from 'typedi';
import { plainToClass } from 'class-transformer';
import { ResolveIfMissing } from '~/middleware';
import { ScoreboardEntry } from './ScoreboardEntry';
import { Game } from './Game';

export class Scoreboard {
  @Field(() => Game)
  @ResolveIfMissing('game', 'gameId')
  game: Game;
  gameId: string;

  scores?: ScoreboardEntry[];

  @Field(() => [ScoreboardEntry], { name: 'scores' })
  async fetchScores() {
    if (typeof this.scores === 'undefined') {
      const teams = await Container.get(PrismaClient).team.findMany({
        where: {
          game: { id: this.gameId },
          points: { gt: 0 }
        },
        orderBy: { points: 'desc' },
        include: {
          attempts: {
            where: { correct: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
      this.scores = teams
        .sort((a, b) => {
          // By default sort by highest points
          if (a.points !== b.points) return a.points > b.points ? -1 : 1;
          // This shouldn't ever happen, because you have to have a solution to have points:
          if (!a.attempts || !b.attempts) return 0;
          // If two teams have the same points, sort whoever got there first higher
          return a.attempts[0].createdAt.getTime() < b.attempts[0].createdAt.getTime() ? -1 : 1;
        })
        .map(({ attempts, ...team }, ranking) => plainToClass(ScoreboardEntry, {
          team, // Remove partial attempts so they're all loaded later
          teamId: team.id,
          ranking,
        }));
    }

    return this.scores;
  }
}