import { Resolver, Subscription, Arg, Root } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Message } from '~/types';
import { GameMessageTopic, GameMessagePayload, filterGame } from '~/subscriptions';
import { FindOneIdInput } from '~/inputs';
import { AdminOnlyArg, RequireUserOrArg } from '~/middleware';

@Service()
@Resolver(() => Message)
export class ParticipantMessageResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;
  @Subscription(() => Message, { name: 'messages', topics: GameMessageTopic, filter: filterGame })
  @RequireUserOrArg('where')
  @AdminOnlyArg('where')
  async messagesSubscription(
    @Root() payload: GameMessagePayload,
    @Arg('where', () => FindOneIdInput, { nullable: true }) where?: FindOneIdInput,
  ): Promise<Message> {
    return new Message(payload);
  }
}
