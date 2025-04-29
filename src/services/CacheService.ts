import NodeCache from 'node-cache';
import logger from './LoggerService';

class CacheService {
    private static cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // TTL padrão de 1 hora

    static get<T>(key: string): T | undefined {
        logger.info(`Cache get: ${key}`);
        return this.cache.get<T>(key);
    }

    static set<T>(key: string, value: T, ttl?: number): void {
        this.cache.set(key, value, ttl ?? 3600);
        logger.info(`Cache set: ${key}`);
    }

    static del(key: string): void {
        this.cache.del(key);
        logger.info(`Cache delete: ${key}`);
    }

    static flush(): void {
        this.cache.flushAll();
    }
}

export default CacheService;