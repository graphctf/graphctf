/* eslint-disable node/no-process-env */
import { config as loadEnv } from 'dotenv';

loadEnv();

['DATABASE_URL', 'REDIS_URL', 'REDIS_PREFIX', 'AUTH_SECRET', 'AUTH_AUDIENCE']
  .forEach((req) => { if (!process.env[req]) throw Error(`The ${req} environment variable is required.`); });

const config = {
  debug: process.env.NODE_ENV !== 'production',
  redis: {
    url: process.env.REDIS_URL!,
    prefix: process.env.REDIS_PREFIX!,
  },
  auth: {
    secret: process.env.AUTH_SECRET!,
    audience: process.env.AUTH_AUDIENCE!,
  },
};

export default config;
