import {inject, Provider} from '@loopback/core';
import {RateLimitOptions, RedisClientType} from '../types';
import {RateLimitSecurityBindings} from '../keys';
import {Store} from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import MemcachedStore from 'rate-limit-memcached';
import MongoStore from 'rate-limit-mongo';

export class RatelimitDatasourceProvider
  implements Provider<Store | undefined> {
  constructor(
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly config?: RateLimitOptions,
  ) {}

  value(): Store | undefined {
    if (this.config?.type === 'MemcachedStore') {
      return new MemcachedStore({
        client: this.config?.client,
        expiration: (this.config?.windowMs ?? 60 * 1000) / 1000,
      });
    } else if (this.config?.type === 'MongoStore') {
      return new MongoStore({
        uri: this.config?.uri,
        collectionName: this.config?.collectionName,
        expireTimeMs: (this.config?.windowMs ?? 60 * 1000) / 1000,
      });
    } else {
      return new RedisStore({
        client: this.config?.client as RedisClientType | undefined,
        expiry: (this.config?.windowMs ?? 60 * 1000) / 1000,
      });
    }
  }
}