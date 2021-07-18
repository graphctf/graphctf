import { Resolver, Subscription, Arg, Root, Ctx, Mutation, PubSub, Publisher } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { Prisma, PrismaClient } from '@prisma/client';
import { Context, RequireUser } from '~/context';
import { Challenge } from '~/types';
import {
  GameTopics,
  GameTopicPayload,
  filterGame as filter,
  AttemptTopics,
  AttemptTopicPayload
} from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';
import { checkSolution, scoreChallenge } from '~/utils';

// Hint
// Solution
// Hint Reveal

@Service()
@Resolver(() => Challenge)
export class ChallengeResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;
  @Subscription(() => [Challenge], { name: 'challenges', topics: GameTopics.CHALLENGES, filter })
  async challengesSubscription(
    @Root() { _del }: GameTopicPayload,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Challenge[]> {
    if (_del) return [];
    return Challenge.FromArray(
      await this.prisma.challenge.findMany({ where: { game: where } })
    );
  }

  @Mutation(() => Boolean, { nullable: true })
  @RequireUser()
  async submitFlag(
    @Ctx() { auth }: Context,
    @PubSub(AttemptTopics.SUBMIT) publishAttemptSubmission: Publisher<AttemptTopicPayload>,
    @Arg('challenge', () => FindOneIdInput) challengeWhere: FindOneIdInput,
    @Arg('flag', () => String) flag: string,
  ): Promise<boolean | null> {
    const now = new Date();
    const challenge = await this.prisma.challenge.findUnique({
      where: challengeWhere,
      include: {
        attempts: { where: { correct: true } },
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
    if (challenge.allowsMultiUserSolves && challenge.attempts.filter(a => a.userId === auth.userId)) {
      throw Error('You have already solved this challenge.');
    }
    if (challenge.attempts.filter(a => a.teamId === auth.teamId)) {
      throw Error('Your team has already solved this challenge.');
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
        }
      });
      publishAttemptSubmission({
        game: { id: challenge.gameId },
        challenge: { id: challenge.id },
        attempt: { id: attempt.id },
      });
      return null;
    }

    // Score the challenge
    const correct = challenge.solutions
      .reduce((accum: boolean, s): boolean => accum || checkSolution(s, flag), false);
    const pointsEarned = correct ? scoreChallenge(challenge) : 0;
    await this.prisma.attempt.create({
      data: {
        correct,
        pointsEarned,
        ...attemptData,
      }
    });
    return correct;
  }
}
