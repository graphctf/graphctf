import { registerEnumType } from 'type-graphql';

export enum ChallengeAttemptStatus {
  UNATTEMPTED = 'UNATTEMPTED',
  ATTEMPTED = 'ATTEMPTED',
  ATTEMPTED_UNSOLVED = 'ATTEMPTED_UNSOLVED',
  ATTEMPTED_PENDING = 'ATTEMPTED_PENDING',
  ATTEMPTED_SOLVED = 'ATTEMPTED_SOLVED',
}

registerEnumType(ChallengeAttemptStatus, { name: 'ChallengeAttemptStatus' });
