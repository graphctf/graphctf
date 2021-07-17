import { InputType, Field } from 'type-graphql';
import { IsOptional, MinLength, MaxLength } from 'class-validator';
import { DateGTNullable, DateGTENullable } from '~/validators';

@InputType()
export class EditGameInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string

  @Field(() => Date, { nullable: true })
  visibleAt?: Date

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @DateGTENullable('visibleAt')
  startsAt?: Date

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @DateGTNullable('startsAt')
  endsAt?: Date

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @DateGTENullable('endsAt')
  hiddenAt?: Date
}
