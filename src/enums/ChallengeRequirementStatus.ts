import { registerEnumType } from 'type-graphql';

export enum ChallengeRequirementStatus {
  UNLOCKED = 'UNLOCKED',
  LOCKED = 'LOCKED',
}

registerEnumType(ChallengeRequirementStatus, { name: 'ChallengeRequirementStatus' });
