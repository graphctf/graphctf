import { InputType, Field, ID } from 'type-graphql';
import { Length, Min, IsPositive, IsOptional } from 'class-validator';
import { LT, IIF, DateGTNullable, DateGTENullable } from '~/validators';
import { ChallengeScoringType } from '~/enums';

@InputType()
export class CreateChallengeInput {
  @Field(is => String)
  @Length(1)
  slug: string

  @Field(is => String)
  title: string

  @Field(is => String)
  text: string

  @Field(is => Date, { nullable: true })
  startsAt?: Date

  @Field(is => Date, { nullable: true })
  @IsOptional()
  @DateGTENullable('startsAt')
  endsAt?: Date

  @Field(is => Boolean, { defaultValue: false })
  allowsMultiUserSolves: boolean

  @Field(is => Boolean, { defaultValue: false })
  evaluatedByOrganizer: boolean

  @Field(is => ChallengeScoringType, { defaultValue: ChallengeScoringType.STATIC })
  scoring: ChallengeScoringType

  @Field(is => Number)
  @IsPositive()
  points: number

  @Field(is => Number, { nullable: true })
  @IIF((self: CreateChallengeInput) => self.scoring !== ChallengeScoringType.STATIC)
  @LT('points')
  pointsEnd?: number

  @Field(is => Date, { nullable: true })
  @IIF((self: CreateChallengeInput) => self.scoring === ChallengeScoringType.CHANGE_WITH_TIME)
  pointsStartAt?: Date

  @Field(is => Date, { nullable: true })
  @IIF((self: CreateChallengeInput) => self.scoring === ChallengeScoringType.CHANGE_WITH_TIME)
  pointsEndAt?: Date

  @Field(is => Number, { nullable: true })
  @IIF((self: CreateChallengeInput) => self.scoring === ChallengeScoringType.CHANGE_WITH_SOLVES)
  @Min(1)
  pointsEndSolveCount?: number

  @Field(is => ID, { nullable: true })
  requiresChallengeId?: string
}
