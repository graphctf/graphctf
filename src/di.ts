import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';
import redis, { RedisClient } from 'redis';
import config from '~/config';

Container.set(PrismaClient, new PrismaClient());
Container.set(RedisClient, redis.createClient({
  url: config.redis.url,
  prefix: config.redis.prefix,
  retry_strategy: () => {
    console.warn(`Redis connection lost.`);
    // This could cause problems, especially with subscriptions, but is probably still better than killing the entire
    // server if the Redis connection is lost.
    return 2000;
  }
}));
