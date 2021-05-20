import { registerEnumType } from 'type-graphql';
import { Prisma } from '@prisma/client';

export enum ChallengeAttemptStatus {
  UNATTEMPTED = 'UNATTEMPTED',
  ATTEMPTED = 'ATTEMPTED',
  ATTEMPTED_UNSOLVED = 'ATTEMPTED_UNSOLVED',
  ATTEMPTED_PENDING = 'ATTEMPTED_PENDING',
  ATTEMPTED_SOLVED = 'ATTEMPTED_SOLVED',
}

export function ChallengeAttemptStatusToFilter(
  status: ChallengeAttemptStatus,
  restrictions?: Prisma.AttemptWhereInput | undefined,
): Prisma.AttemptListRelationFilter {
  const map: Record<ChallengeAttemptStatus, Prisma.AttemptListRelationFilter> = {
    [ChallengeAttemptStatus.UNATTEMPTED]: { none: { ...restrictions } },
    [ChallengeAttemptStatus.ATTEMPTED]: { some: { ...restrictions } },
    [ChallengeAttemptStatus.ATTEMPTED_UNSOLVED]: { none: { correct: true, ...restrictions } },
    [ChallengeAttemptStatus.ATTEMPTED_PENDING]: {
      none: { correct: true, ...restrictions },
      some: { reviewRequired: true, reviewCompleted: false, ...restrictions },
    },
    [ChallengeAttemptStatus.ATTEMPTED_SOLVED]: { some: { correct: true, ...restrictions } },
  };
  return map[status];
}

registerEnumType(ChallengeAttemptStatus, { name: 'ChallengeAttemptStatus' });
