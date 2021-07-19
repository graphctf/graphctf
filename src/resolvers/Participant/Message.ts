import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Message } from '~/types';
import { GameTopics, GameTopicPayload, filterGame as filter } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';

@Service()
@Resolver(() => Message)
export class ParticipantMessageResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;
  @Subscription(() => [Message], { name: 'messages', topics: GameTopics.MESSAGES, filter })
  async messagesSubscription(
    @Root() { _del }: GameTopicPayload,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Message[]> {
    if (_del) return [];
    return Message.FromArray(
      await this.prisma.message.findMany({ where: { game: where } })
    );
  }
}
