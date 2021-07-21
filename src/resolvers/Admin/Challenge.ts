import { Resolver, Mutation, Subscription, Arg, PubSub, Publisher} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { AuthRequirement } from '~/context';
import { Challenge } from '~/types';
import { RequireAdmin } from '~/middleware';
import { FindOneIdInput, CreateChallengeInput, EditChallengeInput, FindOneGameSlugOrIdInput } from '~/inputs';
import { GameChallengeUpdateTopic, GameChallengeUpdatePayload } from '~/subscriptions';

// Hint
// Solution
// Attempt
// Hint Reveal

@Service()
@Resolver(() => Challenge)
export class AdminChallengeResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Challenge)
  @RequireAdmin()
  async createChallenge(
    @PubSub(GameChallengeUpdateTopic) publish: Publisher<GameChallengeUpdatePayload>,
    @Arg('game', () => FindOneIdInput) game: FindOneIdInput,
    @Arg('data', () => CreateChallengeInput) data: CreateChallengeInput
  ): Promise<Challenge> {
    const challenge = await this.prisma.challenge.create({
      data: {
        ...data,
        gameId: game.id,
      }
    });
    publish(challenge);
    return new Challenge(challenge);
  }

  @Mutation(() => Challenge)
  @RequireAdmin()
  async editChallenge(
    @PubSub(GameChallengeUpdateTopic) publish: Publisher<GameChallengeUpdatePayload>,
    @Arg('where', () => FindOneGameSlugOrIdInput) where: FindOneGameSlugOrIdInput,
    @Arg('data', () => EditChallengeInput) data: EditChallengeInput,
  ): Promise<Challenge> {
    const challenge = await this.prisma.challenge.update({
      where,
      data,
    });
    publish(challenge);
    return new Challenge(challenge);
  }

  @Mutation(() => Boolean)
  @RequireAdmin()
  async deleteChallenge(
    @PubSub(GameChallengeUpdateTopic) publish: Publisher<GameChallengeUpdatePayload>,
    @Arg('where', () => FindOneGameSlugOrIdInput) where: FindOneGameSlugOrIdInput,
  ): Promise<boolean> {
    const challenge = await this.prisma.challenge.findUnique({ where });
    if (!challenge) throw Error('Challenge not found.');
    await this.prisma.hintReveal.deleteMany({ where: { challenge: where } });
    await this.prisma.hint.deleteMany({ where: { challenge: where } });
    await this.prisma.attempt.deleteMany({ where: { challenge: where } });
    await this.prisma.solution.deleteMany({ where: { challenge: where } });
    await this.prisma.challenge.delete({
      where: where.id
        ? { id: where.id }
        : { slug_gameId: { slug: where.slug!, gameId: where.gameId! }}
    });
    publish({ ...challenge, __deleted: true });
    return true;
  }
}
