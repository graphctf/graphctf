import { ChallengeScoringType, SolutionType, UserRole } from '@prisma/client';
import { registerEnumType } from 'type-graphql';

export { ChallengeScoringType, SolutionType, UserRole };

export * from './ChallengeVisibilityStatus';
export * from './ChallengeRequirementStatus';
export * from './ChallengeAttemptStatus';

registerEnumType(ChallengeScoringType, { name: 'ChallengeScoringType' });
registerEnumType(SolutionType, { name: 'ChallengeSolutionType' });
registerEnumType(UserRole, { name: 'UserRole' });
