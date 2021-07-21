import { Resolver, Mutation, Arg, PubSub, Publisher } from 'type-graphql';
import { Service, Inject } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { Message } from '~/types';
import { FindOneIdInput } from '~/inputs';
import { RequireAdmin } from '~/middleware';
import { GameMessageTopic, GameMessagePayload } from '~/subscriptions';

@Service()
@Resolver(() => Message)
export class AdminMessageResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Message)
  @RequireAdmin()
  async sendMessage(
    @PubSub(GameMessageTopic) publish: Publisher<GameMessagePayload>,
    @Arg('game', type => FindOneIdInput) game: FindOneIdInput,
    @Arg('title', type => String) title: string,
    @Arg('content', type => String) content: string,
  ): Promise<Message> {
    const message = await this.prisma.message.create({
      data: {
        title,
        content,
        game: {
          connect: game
        },
      },
    });
    publish(message);
    return new Message(message);
  }

  @Mutation(() => Boolean)
  @RequireAdmin()
  async deleteMessage(
    @PubSub(GameMessageTopic) publish: Publisher<GameMessagePayload>,
    @Arg('where', type => FindOneIdInput) where: FindOneIdInput,
  ): Promise<boolean> {
    const message = await this.prisma.message.findUnique({ where });
    if (!message) throw Error('Message not found.');
    await this.prisma.message.delete({ where });
    publish({ ...message, __deleted: true });
    return true;
  }
}
