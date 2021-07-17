import { InputType, Field, Ctx } from 'type-graphql';
import { Prisma } from '@prisma/client';
import {
  ChallengeRequirementStatus,
  ChallengeVisibilityStatus,
  ChallengeVisibilityStatusToWhere,
  ChallengeAttemptStatus,
  ChallengeAttemptStatusToFilter,
  ChallengeRequirementStatusToWhere,
} from '~/enums';
import { Context } from '~/context';
import { TagFilterInput } from '~/inputs/Tag';

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

  toQuery(@Ctx() ctx: Context): Prisma.ChallengeWhereInput {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (!ctx?.auth?.isUser && (this.requirementStatus || this.attemptStatus)) {
      throw Error(`You requested to filter by properties which require you to be logged in.`);
    }

    return {
      AND: [
        this.tag
          ? { tags: { some: this.tag } }
          : {},
        this.visibilityStatus
          ? ChallengeVisibilityStatusToWhere(this.visibilityStatus)
          : {},
        this.requirementStatus
          ? ChallengeRequirementStatusToWhere(this.requirementStatus, { team: { id: ctx.auth.teamId! } })
          : {},
        this.attemptStatus
          ? { attempts: ChallengeAttemptStatusToFilter(this.attemptStatus, { team: { id: ctx.auth.teamId! } }) }
          : {},
      ],
    };
  }
}
