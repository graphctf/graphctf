import { Resolver, Query, Mutation, Arg, Subscription, PubSub, Publisher, Root } from 'type-graphql';
import { Service, Inject } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Attempt, Scoreboard, Game } from '~/types';
import { FindOneIdInput } from '~/inputs';
import {
  AdminAttemptSubmitTopic,
  AdminAttemptSubmitPayload,
  TeamChallengeAttemptReviewTopic,
  TeamChallengeAttemptReviewPayload,
  GameScoreUpdateTopic,
  GameScoreUpdatePayload,
} from '~/subscriptions';
import { calculatePenalty, scoreChallenge } from '~/utils';
import { RequireAdmin } from '~/middleware';

@Resolver(() => Attempt)
@Service()
export class AdminReviewResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Subscription(() => Attempt, {
    name: 'attemptsPendingReview',
    topics: AdminAttemptSubmitTopic,
    filter: ({ args, payload }) => !args.where?.id || args.where.id === payload.gameId,
  })
  @RequireAdmin()
  async attemptsPendingReviewSubscription(
    @Root() payload: AdminAttemptSubmitPayload,
    @Arg('whereGame', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Attempt> {
    return new Attempt(payload);
  }

  @Query(() => [Attempt])
  @RequireAdmin()
  async attemptsPendingReview(
    @Arg('whereGame', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Attempt[]> {
    return Attempt.FromArray(await this.prisma.attempt.findMany({
      where: {
        reviewRequired: true,
        reviewCompleted: false,
        ...(where || {}),
      }
    }));
  }

  @Mutation(() => Boolean)
  @RequireAdmin()
  async submitAttemptReview(
    @PubSub(TeamChallengeAttemptReviewTopic) publishTeamReview: Publisher<TeamChallengeAttemptReviewPayload>,
    @PubSub(AdminAttemptSubmitTopic) publishAdminAttempt: Publisher<AdminAttemptSubmitPayload>,
    @PubSub(GameScoreUpdateTopic) publishScoreUpdate: Publisher<GameScoreUpdatePayload>,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
    @Arg('correct', () => Boolean) correct: boolean,
  ): Promise<boolean> {
    const attempt = await this.prisma.attempt.findUnique({ where, include: { challenge: true } });
    if (!attempt) throw Error('Attempt not found.');
    if (!attempt.reviewRequired || attempt.reviewCompleted) throw Error('Review not required.');
    const pointsEarned = correct
      ? Math.max(
          0,
          (await scoreChallenge(attempt.challenge)) - (await calculatePenalty(attempt.challengeId, attempt.teamId))
        )
      : 0;

    if (pointsEarned > 0) {
      await this.prisma.$executeRaw`update Team set points = points + ${pointsEarned} where id = ${attempt.teamId}`;
    }
    const updatedAttempt = await this.prisma.attempt.update({
      where,
      data: {
        reviewCompleted: true,
        correct,
        pointsEarned,
      },
      include: { challenge: true, team: true, game: true },
    });

    publishAdminAttempt({ ...updatedAttempt, __deleted: true });
    publishTeamReview(updatedAttempt);
    if (pointsEarned > 0) {
      const scoreboard = new Scoreboard();
      scoreboard.game = new Game(updatedAttempt.game);
      scoreboard.gameId = attempt.gameId;
      await scoreboard.fetchScores();
      publishScoreUpdate(scoreboard);
    }
    return true;
  }
}