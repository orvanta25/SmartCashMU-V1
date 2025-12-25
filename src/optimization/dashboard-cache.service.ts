import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class DashboardCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getOrCompute<T>(key: string, computeFn: () => Promise<T>, ttl = 300): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached !== undefined) return cached;
    const result = await computeFn();
    await this.cacheManager.set(key, result, ttl);
    return result;
  }
}
