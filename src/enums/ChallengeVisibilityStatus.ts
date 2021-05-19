import { registerEnumType } from 'type-graphql';

export enum ChallengeVisibilityStatus {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN'
}

registerEnumType(ChallengeVisibilityStatus, { name: 'ChallengeVisibilityStatus' });
