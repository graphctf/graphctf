import { InputType, Field } from 'type-graphql';

@InputType()
export class FindOneIdInput {
  @Field(() => String)
  id: string;
}
