import { Container } from 'typedi';
import { PrismaClient, Attempt } from '@prisma/client';

export async function calculatePenalty(challengeId: string, teamId: string): Promise<number> {
  const hintReveals = await Container.get(PrismaClient).hint.aggregate({
    _sum: { penalty: true },
    where: {
      challenge: { id: challengeId },
      hintReveals: { some: { teamId } },
    },
  });
  return hintReveals._sum.penalty || 0;
}