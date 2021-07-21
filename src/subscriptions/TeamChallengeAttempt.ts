import { Attempt, Team, Challenge } from '@prisma/client';

export const TeamChallengeAttemptTopic = 'TEAM_CHALLENGE_ATTEMPT';
export type TeamChallengeAttemptPayload = Attempt & { team: Team, challenge: Challenge };