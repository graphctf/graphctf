import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import config from '~/config';

Container.set(PrismaClient, new PrismaClient());
Container.set('redis', new Redis(config.redis.url, {
  keyPrefix: config.redis.prefix,
  retryStrategy: () => (Math.random() * 5000) + 1000,
}));
