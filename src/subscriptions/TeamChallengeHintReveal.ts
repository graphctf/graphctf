import { HintReveal, Hint, Team, Challenge } from '@prisma/client';

export const TeamChallengeHintRevealTopic = 'TEAM_CHALLENGE_HINT_REVEAL';
export type TeamChallengeHintRevealPayload = HintReveal & { hint: Hint, team: Team, challenge: Challenge };