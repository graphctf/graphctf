import { InputType, Field } from 'type-graphql';
import { MinLength, MaxLength } from 'class-validator';
import { DateGT, DateGTE } from '~/validators';

@InputType()
export class CreateGameInput {
  @Field(() => String)
  @MinLength(1)
  @MaxLength(100)
  name: string

  @Field(() => Date)
  visibleAt: Date

  @Field(() => Date)
  @DateGTE('visibleAt')
  startsAt: Date

  @Field(() => Date)
  @DateGT('startsAt')
  endsAt: Date

  @Field(() => Date)
  @DateGTE('endsAt')
  hiddenAt: Date
}
