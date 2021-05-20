import { ResolverData } from 'type-graphql';
import { UserRole } from '@prisma/client';
import { Context } from '..';

export enum AuthRequirement {
  ADMIN = 'ADMIN',
  USER = 'USER',
  CAPTAIN = 'CAPTAIN',
}

export function authChecker({ context }: ResolverData<Context>, roles: Array<AuthRequirement>): boolean {
  if (!context.auth || !context.auth.isAuthenticated) return false;
  if (roles.includes(AuthRequirement.ADMIN) && !context.auth.isAdmin) return false;
  if ((roles.includes(AuthRequirement.USER) || roles.includes(AuthRequirement.CAPTAIN)) && context.auth.isUser) {
    return false;
  }
  if (roles.includes(AuthRequirement.CAPTAIN) && context.auth.role !== UserRole.CAPTAIN) return false;
  return true;
}
