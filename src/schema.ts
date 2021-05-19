import path from 'path';
import { buildSchema } from 'type-graphql';
import { GraphQLSchema } from 'graphql';
import { Container } from 'typedi';
import resolvers from './resolvers';

export async function createSchema() : Promise<GraphQLSchema> {
  return buildSchema({
    resolvers,
    container: Container,
    emitSchemaFile: path.resolve(
      __dirname,
      '../generated/generated-schema.graphql',
    ),
    validate: false,
  });
}
