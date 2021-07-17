import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisRead, RedisWrite } from './redis';

Container.set(PrismaClient, new PrismaClient());
Container.set(RedisRead, new RedisRead());
Container.set(RedisWrite, new RedisWrite());
Container.set(RedisPubSub, new RedisPubSub({
  publisher: Container.get(RedisWrite),
  subscriber: Container.get(RedisRead),
}))
