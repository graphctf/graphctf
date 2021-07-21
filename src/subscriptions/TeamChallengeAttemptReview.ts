import { Attempt, Team, Challenge } from '@prisma/client';

export const TeamChallengeAttemptReviewTopic = 'TEAM_CHALLENGE_ATTEMPT_REVIEW';
export type TeamChallengeAttemptReviewPayload = Attempt & { team: Team, challenge: Challenge };