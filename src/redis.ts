import { promisify } from 'util';
import redis from 'redis';
import config from './config';

const client = redis.createClient(config.redis.url);

export function makeCache(prefix: string, defaultLifetime?: number | undefined) {
  const prefixKey = (key: string) => `${config.redis.prefix}.${prefix}.${key}`;
  return {
    get: async (key: string) => promisify(client.get).bind(client)(prefixKey(key)),
    has: async (key: string) => (
      // eslint-disable-next-line @typescript-eslint/ban-types
      Boolean(await (<Function>promisify(client.exists).bind(client))(prefixKey(key)))
    ),
    set: async (key: string, val: string, lifetime?: number | undefined) => {
      await promisify(client.set).bind(client)(prefixKey(key), val);
      if (lifetime || defaultLifetime) {
        await promisify(client.expire).bind(client)(prefixKey(key), lifetime! || defaultLifetime!);
      }
    },
    delete: async (key: string) => (
      // eslint-disable-next-line @typescript-eslint/ban-types
      Boolean(await (<Function><unknown>promisify(client.del).bind(client))(prefixKey(key)))
    ),
  };
}
