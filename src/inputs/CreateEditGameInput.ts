import { InputType, Field } from 'type-graphql';

@InputType()
export class CreateEditGameInput {
  @Field(() => String)
  name: string

  @Field(() => Date)
  visibleAt: Date

  @Field(() => Date)
  startsAt: Date

  @Field(() => Date)
  endsAt: Date

  @Field(() => Date)
  hiddenAt: Date
}
