import { ChallengeScoringType, SolutionType, UserRole } from '@prisma/client';
import { registerEnumType } from 'type-graphql';

export { ChallengeScoringType, SolutionType, UserRole };

export { ChallengeVisibilityStatus } from './ChallengeVisibilityStatus';
export { ChallengeRequirementStatus } from './ChallengeRequirementStatus';
export { ChallengeAttemptStatus } from './ChallengeAttemptStatus';

registerEnumType(ChallengeScoringType, { name: 'ChallengeScoringType' });
registerEnumType(SolutionType, { name: 'ChallengeScoringType' });
registerEnumType(UserRole, { name: 'ChallengeScoringType' });
