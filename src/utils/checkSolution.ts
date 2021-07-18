import { Solution } from '@prisma/client';
import { SolutionType } from '~/enums';

export function checkSolution({ type, text }: Solution, submission: string): boolean {
  if (type === SolutionType.TEXT_SENSITIVE) return text === submission;
  if (type === SolutionType.TEXT) return text.toUpperCase().trim() === submission.toUpperCase().trim();
  if (type === SolutionType.REGEX) (new RegExp(text)).test(submission);
  throw Error('Unsupported solution type.');
}
