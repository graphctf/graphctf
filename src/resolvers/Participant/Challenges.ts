import { Resolver, Subscription, Arg, Root, Ctx, Mutation, PubSub, Publisher } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { Prisma, PrismaClient } from '@prisma/client';
import { Context } from '~/context';
import { AdminOnlyArg, RequireUser, RequireUserOrArg } from '~/middleware';
import { Challenge, Attempt, Scoreboard, Game } from '~/types';
import { FindOneIdInput } from '~/inputs';
import { calculatePenalty, checkSolution, scoreChallenge } from '~/utils';
import {
  GameChallengeUpdateTopic,
  GameChallengeUpdatePayload,
  TeamChallengeAttemptTopic,
  TeamChallengeAttemptPayload,
  AdminAttemptSubmitTopic,
  AdminAttemptSubmitPayload,
  GameScoreUpdateTopic,
  GameScoreUpdatePayload,
  filterGame,
  filterTeam,
  TeamChallengeAttemptReviewPayload,
} from '~/subscriptions';

@Service()
@Resolver(() => Challenge)
export class ParticipantChallengeResolver {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Subscription(() => Challenge, { name: 'challenges', topics: GameChallengeUpdateTopic, filter: filterGame })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async challengesSubscription(
    @Root() payload: GameChallengeUpdatePayload,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Challenge> {
    return new Challenge(payload);
  }

  @Subscription(() => Challenge, { name: 'challengeAttempts', topics: TeamChallengeAttemptTopic, filter: filterTeam })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async challengeAttemptsSubscription(
    @Root() payload: TeamChallengeAttemptPayload,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Attempt> {
    return new Attempt(payload);
  }

  @Subscription(() => Challenge, {
    name: 'challengeAttemptReviews',
    topics: AdminAttemptSubmitTopic,
    filter: filterTeam,
  })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async challengeAttemptReviewsSubscription(
    @Root() payload:TeamChallengeAttemptReviewPayload,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Attempt> {
    return new Attempt(payload);
  }

  @Mutation(() => Boolean, { nullable: true })
  @RequireUser()
  async attemptChallenge(
    @PubSub(TeamChallengeAttemptTopic) publishChallengeAttempt: Publisher<TeamChallengeAttemptPayload>,
    @PubSub(AdminAttemptSubmitTopic) publishAdminAttempt: Publisher<AdminAttemptSubmitPayload>,
    @PubSub(GameScoreUpdateTopic) publishScoreUpdate: Publisher<GameScoreUpdatePayload>,
    @Ctx() { auth }: Context,
    @Arg('challenge', () => FindOneIdInput) challengeWhere: FindOneIdInput,
    @Arg('solution', () => String) flag: string,
  ): Promise<boolean | null> {
    const now = new Date();
    const challenge = await this.prisma.challenge.findUnique({
      where: challengeWhere,
      include: {
        attempts: {
          where: {
            teamId: auth.teamId!,
            OR: [{ correct: true }, { reviewRequired: true, reviewCompleted: false }]
          }
        },
        solutions: true,
      },
    });
    const attemptData: Pick<Prisma.AttemptCreateInput, 'submission' | 'game' | 'team' | 'user' | 'challenge'> = {
      submission: flag,
      game: { connect: { id: auth.gameId! } },
      team: { connect: { id: auth.teamId! } },
      user: { connect: { id: auth.userId! } },
      challenge: { connect: challengeWhere },
    };

    // Validate whether the challenge can be attempted.
    if (!challenge || challenge.gameId !== auth.gameId) throw Error('Challenge does not exist.');
    if (challenge.allowsMultiUserSolves && challenge.attempts.filter(a => a.userId === auth.userId && a.correct)) {
      throw Error('You have already solved this challenge.');
    }
    if (challenge.attempts.filter(a => a.teamId === auth.teamId && a.correct)) {
      throw Error('Your team has already solved this challenge.');
    }
    if (challenge.attempts.filter(a => a.teamId === auth.teamId && a.reviewRequired && !a.reviewCompleted)) {
      throw Error('Your team already has a pending submission for this challenge.');
    }
    if (
      (challenge.startsAt && challenge.startsAt.getTime() > now.getTime())
      || (challenge.endsAt && challenge.endsAt.getTime() < now.getTime())
    ) {
      throw Error('Challenge not available.');
    }

    // For organizer-scored challenges, save the attempt and emit an event
    if (challenge.evaluatedByOrganizer) {
      const attempt = await this.prisma.attempt.create({
        data: {
          correct: null,
          pointsEarned: null,
          reviewRequired: true,
          reviewCompleted: false,
          ...attemptData,
        },
        include: { challenge: true, team: true },
      });
      publishChallengeAttempt(attempt);
      publishAdminAttempt(attempt);
      return null;
    }

    // Score the challenge
    const correct = challenge.solutions
      .reduce((accum: boolean, s): boolean => accum || checkSolution(s, flag), false);
    const pointsEarned = correct
      ? Math.max(0, (await scoreChallenge(challenge)) - (await calculatePenalty(challenge.id, auth.teamId!)))
      : 0;
    if (pointsEarned > 0) {
      await this.prisma.$executeRaw`update Team set points = points + ${pointsEarned} where id = ${auth.teamId!}`;
    }
    const attempt = await this.prisma.attempt.create({
      data: {
        correct,
        pointsEarned,
        ...attemptData,
      },
      include: { challenge: true, team: true, game: true },
    });
    publishChallengeAttempt(attempt);
    if (pointsEarned > 0) {
      const scoreboard = new Scoreboard();
      scoreboard.game = new Game(attempt.game);
      scoreboard.gameId = attempt.gameId;
      await scoreboard.fetchScores();
      publishScoreUpdate(scoreboard);
    }
    return correct;
  }
}
