import { Resolver, Subscription, Arg } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Game, Challenge, Team, Message } from '~/types';
import { GameTopics, GameTopicFilter } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';

// Hint
// Solution
// Attempt
// Hint Reveal


function filter({ payload, args, context }: GameTopicFilter) {
  return payload.game.id === args.where.id;
}

@Service()
@Resolver()
export class GameSubscriptionResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Subscription(() => Game, { name: 'game', topics: GameTopics.GAME, filter })
  async gameSubscription(
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Challenge[]> {
    return Challenge.FromArray(
      await this.prisma.challenge.findMany({ where: { game: where } })
    );
  }

  @Subscription(() => [Challenge], { name: 'challenges', topics: GameTopics.CHALLENGES, filter })
  async challengesSubscription(
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Challenge[]> {
    return Challenge.FromArray(
      await this.prisma.challenge.findMany({ where: { game: where } })
    );
  }

  @Subscription(() => [Message], { name: 'messages', topics: GameTopics.MESSAGES, filter })
  async messagesSubscription(
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Message[]> {
    return Message.FromArray(
      await this.prisma.message.findMany({ where: { game: where } })
    );
  }

  @Subscription(() => [Team], { name: 'teams', topics: GameTopics.TEAMS, filter })
  async teamsSubscription(
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Team[]> {
    return Team.FromArray(
      await this.prisma.team.findMany({ where: { game: where } })
    );
  }

  @Subscription(() => [Team], { name: 'score', topics: GameTopics.SCORES, filter })
  async scoresSubscription(
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Team[]> {
    // TODO(@tylermenezes) Scoreboard type
    return Team.FromArray(
      await this.prisma.team.findMany({ where: { game: where } })
    );
  }
}
