import { ObjectType, Field } from 'type-graphql';
import { Team } from './Team';

@ObjectType()
export class ScoreboardEntry {
  @Field(() => Number)
  ranking: number

  // Relations
  @Field(() => Team)
  team: Team

  teamId: string
}
