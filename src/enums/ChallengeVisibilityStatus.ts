import { registerEnumType } from 'type-graphql';
import { Prisma } from '@prisma/client';

export enum ChallengeVisibilityStatus {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN'
}

export function ChallengeVisibilityStatusToWhere(status: ChallengeVisibilityStatus): Prisma.ChallengeWhereInput {
  const now = new Date();
  const filterVisible: Prisma.ChallengeWhereInput = {
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
    ],
  };
  if (status === ChallengeVisibilityStatus.VISIBLE) return filterVisible;
  return { NOT: filterVisible };
}

registerEnumType(ChallengeVisibilityStatus, { name: 'ChallengeVisibilityStatus' });
