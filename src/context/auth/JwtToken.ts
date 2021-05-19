import { UserRole } from '../../enums';

export interface JwtToken {
  /* Admin: if `true`, user is global admin. */
  adm?: boolean | undefined

  /* Id of the game the user is a member/admin of. Requires unless admin is true. */
  gam?: string | undefined

  /* Slug of the team the user is on, if changed all solves will be lost. Ignored if undefined. */
  tea?: string | undefined

  /* Username, may only be undefined if `a` is not null. */
  sub?: string | undefined

  /* Role, defaults to USER. */
  rol?: UserRole | undefined
}
