import { Game as PrismaGame } from '@prisma/client';
import { ObjectType, Field } from 'type-graphql';
import { User } from './User';
import { Team } from './Team';
import { Challenge } from './Challenge';
import { Hint } from './Hint';
import { Attempt } from './Attempt';
import { HintReveal } from './HintReveal';
import { Message } from './Message';
import { Tag } from './Tag';
import { Solution } from './Solution';

@ObjectType()
export class Game implements PrismaGame {
  // Metadata
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Data
  @Field(() => String)
  slug: string

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

  // Relations
  @Field(() => [User])
  users: User[]

  @Field(() => [Team])
  teams: Team[]

  @Field(() => [Challenge])
  challenges: Challenge[]

  @Field(() => [Hint])
  hints: Hint[]

  @Field(() => [Attempt])
  attempts: Attempt[]

  @Field(() => [HintReveal])
  hintReveals: HintReveal[]

  @Field(() => [Message])
  messages: Message[]

  @Field(() => [Tag])
  tags: Tag[]

  @Field(() => [Solution])
  solutions: Solution[]
}
