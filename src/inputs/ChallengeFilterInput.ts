import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';
import { TagFilterInput } from './TagFilterInput';
import { ChallengeRequirementStatus, ChallengeVisibilityStatus, ChallengeAttemptStatus } from '../enums';

@InputType()
export class ChallengeFilterInput {
  @Field(() => TagFilterInput, { nullable: true })
  tag?: TagFilterInput | undefined

  @Field(() => ChallengeVisibilityStatus, { nullable: true })
  visibilityStatus?: ChallengeVisibilityStatus | undefined

  @Field(() => ChallengeRequirementStatus, { nullable: true })
  requirementStatus?: ChallengeRequirementStatus | undefined

  @Field(() => ChallengeAttemptStatus, { nullable: true })
  attemptStatus?: ChallengeAttemptStatus | undefined

  toQuery(): Prisma.ChallengeWhereInput {
    return {
      tags: this.tag ? { some: this.tag.toQuery() } : undefined,
      // TODO(@tylermenezes)
    };
  }
}
