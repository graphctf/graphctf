import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class AuthorizationTokenResponse {
  @Field(() => String)
  token: string;

  @Field(() => Date)
  expiresAt: Date;
}
