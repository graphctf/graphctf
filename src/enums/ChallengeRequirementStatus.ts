import { Prisma } from '@prisma/client';
import { registerEnumType } from 'type-graphql';

export enum ChallengeRequirementStatus {
  UNLOCKED = 'UNLOCKED',
  LOCKED = 'LOCKED',
}

export function ChallengeRequirementStatusToWhere(
  status: ChallengeRequirementStatus,
  restrictions?: Prisma.AttemptWhereInput | undefined,
): Prisma.ChallengeWhereInput {
  if (status === ChallengeRequirementStatus.LOCKED) {
    return {
      requiresChallenge: {
        attempts: { none: { correct: true, ...restrictions } },
      },
    };
  }

  return {
    requiresChallenge: {
      attempts: { some: { correct: true, ...restrictions } },
    },
  };
}

registerEnumType(ChallengeRequirementStatus, { name: 'ChallengeRequirementStatus' });
