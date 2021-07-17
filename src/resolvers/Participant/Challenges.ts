import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Challenge } from '~/types';
import { GameTopics, GameTopicPayload, filterGame as filter } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';

// Hint
// Solution
// Attempt
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
}
