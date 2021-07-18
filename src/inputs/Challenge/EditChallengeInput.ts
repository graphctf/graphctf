import { InputType, Field, ID } from 'type-graphql';
import { Length, Min, IsPositive, IsOptional } from 'class-validator';
import { DateGTENullable } from '~/validators';
import { ChallengeScoringType } from '~/enums';

// TODO(@tylermenezes): To properly validate this, we'd need to pull information from the database

@InputType()
export class EditChallengeInput {
  @Field(is => String, { nullable: true })
  @IsOptional()
  @Length(1)
  slug?: string

  @Field(is => String, { nullable: true })
  title?: string

  @Field(is => String, { nullable: true })
  text?: string

  @Field(is => Date, { nullable: true })
  startsAt?: Date

  @Field(is => Date, { nullable: true })
  @IsOptional()
  @DateGTENullable('startsAt')
  endsAt?: Date

  @Field(is => Boolean, { nullable: true })
  allowsMultiUserSolves?: boolean

  @Field(is => Boolean, { nullable: true })
  evaluatedByOrganizer?: boolean

  @Field(is => ChallengeScoringType, { nullable: true })
  scoring: ChallengeScoringType

  @Field(is => Number, { nullable: true })
  @IsOptional()
  @IsPositive()
  points?: number

  @Field(is => Number, { nullable: true })
  pointsEnd?: number

  @Field(is => Date, { nullable: true })
  pointsStartAt?: Date

  @Field(is => Date, { nullable: true })
  pointsEndAt?: Date

  @Field(is => Number, { nullable: true })
  @IsOptional()
  @Min(1)
  pointsEndSolveCount?: number

  @Field(is => ID, { nullable: true })
  requiresChallengeId?: string
}
