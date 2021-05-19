import { PrismaClient } from '@prisma/client';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { AuthContext } from './auth/AuthContext';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient,
  auth: AuthContext,
}

export async function createContext({ req, connection }: ExpressContext): Promise<Context> {
  const token = connection ? connection.context.authorization : req.headers.authorization;

  return {
    prisma,
    auth: new AuthContext(token),
  };
}
