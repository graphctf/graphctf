import { Resolver, Mutation, Authorized, Arg} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { AuthRequirement } from '~/context';
import { Challenge } from '~/types';
import { FindOneIdInput, CreateChallengeInput, EditChallengeInput, FindOneGameSlugOrIdInput } from '~/inputs';

// Hint
// Solution
// Attempt
// Hint Reveal

@Service()
@Resolver(() => Challenge)
export class ChallengeResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Authorized(AuthRequirement.ADMIN)
  @Mutation(() => Challenge)
  async createChallenge(
    @Arg('game', () => FindOneIdInput) game: FindOneIdInput,
    @Arg('challenge', () => CreateChallengeInput) challenge: CreateChallengeInput
  ): Promise<void> {
    // TODO(@tylermenezes)
  }

  @Authorized(AuthRequirement.ADMIN)
  @Mutation(() => Challenge)
  async editChallenge(
    @Arg('where', () => FindOneGameSlugOrIdInput) where: FindOneGameSlugOrIdInput,
    @Arg('challenge', () => EditChallengeInput) challenge: EditChallengeInput,
  ): Promise<void> {
    // TODO(@tylermenezes)
  }

  @Authorized(AuthRequirement.ADMIN)
  @Mutation(() => Boolean)
  async deleteChallenge(
    @Arg('where', () => FindOneGameSlugOrIdInput) where: FindOneGameSlugOrIdInput,
  ): Promise<boolean> {
    await this.prisma.hintReveal.deleteMany({ where: { challenge: where } });
    await this.prisma.hint.deleteMany({ where: { challenge: where } });
    await this.prisma.attempt.deleteMany({ where: { challenge: where } });
    await this.prisma.solution.deleteMany({ where: { challenge: where } });
    await this.prisma.challenge.delete({
      where: where.id
        ? { id: where.id }
        : { slug_gameId: { slug: where.slug!, gameId: where.gameId! }}
    });
    return true;
  }
}
