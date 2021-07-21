import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Message } from '~/types';
import { GameMessageTopic, GameMessagePayload, filterGame } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';

@Service()
@Resolver(() => Message)
export class ParticipantMessageResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;
  @Subscription(() => Message, { name: 'messages', topics: GameMessageTopic, filter: filterGame })
  async messagesSubscription(
    @Root() payload: GameMessagePayload,
    @Arg('where', () => FindOneIdInput) where: FindOneIdInput,
  ): Promise<Message> {
    return new Message(payload);
  }
}
