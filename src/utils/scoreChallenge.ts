import { Container } from 'typedi';
import { PrismaClient, Challenge, Attempt } from '@prisma/client';
import { ChallengeScoringType } from '~/enums';

export async function scoreChallenge(challenge: Challenge): Promise<number> {
  if (challenge.scoring === ChallengeScoringType.STATIC) return challenge.points;

  if (!challenge.pointsEnd) throw Error('Missing scoring end points.');
  const pointDelta = challenge.pointsEnd - challenge.points;

  if (challenge.scoring === ChallengeScoringType.CHANGE_WITH_TIME) {
    if (!challenge.pointsStartAt || !challenge.pointsEndAt) {
      throw Error('Missing time-based scoring information.');
    }
    const now = new Date();
    if (now.getTime() <= challenge.pointsStartAt.getTime()) return challenge.points;
    if (now.getTime() >= challenge.pointsEndAt.getTime()) return challenge.pointsEnd;

    const decreaseDuration = challenge.pointsEndAt.getTime() - challenge.pointsStartAt.getTime();
    const percentToFinal = (now.getTime() - challenge.pointsStartAt.getTime()) / decreaseDuration;
    return challenge.points + (pointDelta * percentToFinal);
  }

  if (challenge.scoring === ChallengeScoringType.CHANGE_WITH_SOLVES) {
    if (!challenge.pointsEndSolveCount) throw Error('Missing solve-based scoring information.');
    const solves = await Container.get(PrismaClient).attempt.aggregate({
      _count: { id: true },
      where: {
        challengeId: challenge.id,
        correct: true,
      },
    });
    const solvesCount = solves._count.id || 0;

    const percentToFinal = Math.min(1, solvesCount/challenge.pointsEndSolveCount);
    return challenge.points + (pointDelta * percentToFinal);
  }

  throw Error('Unsupported scoring method.');
}
