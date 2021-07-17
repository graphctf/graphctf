import { Container } from 'typedi';
import Redis, { Redis as RedisType } from 'ioredis';
import { fakeBaseClass } from '~/utils';
import config from '~/config';

class RedisProxy extends fakeBaseClass<RedisType>() {
  public __redis: RedisType;

  constructor() {
    super();
    let handler = {
      get: function (target: RedisProxy, prop: keyof RedisType, receiver: any) {
        if (Redis.prototype[prop] !== null) {
          return target.__redis[prop];
        }

        return Reflect.get(target, prop, receiver);
      }
    }
    return new Proxy(this, handler);
  }
}

export class RedisRead extends RedisProxy {
  constructor() {
    super();
    this.__redis = new Redis(config.redis.url, {
      keyPrefix: config.redis.prefix,
      retryStrategy: () => (Math.random() * 5000) + 1000,
    });
  }
}

export class RedisWrite extends RedisProxy {
  constructor() {
    super();
    if (config.redis.writeUrl && config.redis.writeUrl !== config.redis.url) {
      this.__redis = new Redis(config.redis.url, {
        keyPrefix: config.redis.prefix,
        retryStrategy: () => (Math.random() * 5000) + 1000,
      });
    } else {
      this.__redis = Container.get(RedisRead).__redis;
    }
  }
}
