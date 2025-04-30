import NodeCache from 'node-cache';
import logger from './LoggerService';

// Constantes para valores reutilizáveis
const DEFAULT_TTL = 3600; // 1 hora
const DEFAULT_CHECK_PERIOD = 600; // 10 minutos

class CacheService {
    private static nodeCacheInstance = new NodeCache({ stdTTL: DEFAULT_TTL, checkperiod: DEFAULT_CHECK_PERIOD });

    static get<T>(key: string): T | undefined {
        try {
            logger.info(`Cache get: ${key}`);
            return this.nodeCacheInstance.get<T>(key);
        } catch (error) {
            logger.error(`Error getting cache key "${key}": ${error}`);
            return undefined;
        }
    }

    static set<T>(key: string, value: T, ttl?: number): void {
        try {
            this.nodeCacheInstance.set(key, value, ttl ?? DEFAULT_TTL);
            logger.info(`Cache set: ${key}`);
        } catch (error) {
            logger.error(`Error setting cache key "${key}": ${error}`);
        }
    }

    static del(key: string): void {
        try {
            this.nodeCacheInstance.del(key);
            logger.info(`Cache delete: ${key}`);
        } catch (error) {
            logger.error(`Error deleting cache key "${key}": ${error}`);
        }
    }

    static flush(): void {
        try {
            this.nodeCacheInstance.flushAll();
            logger.info('Cache flushed');
        } catch (error) {
            logger.error(`Error flushing cache: ${error}`);
        }
    }
}

export default CacheService;