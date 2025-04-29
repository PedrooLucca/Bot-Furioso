import CacheService from '../src/services/CacheService';

describe('CacheService', () => {
    beforeEach(() => {
        CacheService.flush();
    });

    it('should store and retrieve data from the cache', () => {
        CacheService.set('testKey', 'testValue');
        const value = CacheService.get<string>('testKey');
        expect(value).toBe('testValue');
    });

    it('should return undefined for non-existent keys', () => {
        const value = CacheService.get<string>('nonExistentKey');
        expect(value).toBeUndefined();
    });

    it('should delete a key from the cache', () => {
        CacheService.set('testKey', 'testValue');
        CacheService.del('testKey');
        const value = CacheService.get<string>('testKey');
        expect(value).toBeUndefined();
    });

    it('should flush all keys from the cache', () => {
        CacheService.set('key1', 'value1');
        CacheService.set('key2', 'value2');
        CacheService.flush();
        expect(CacheService.get<string>('key1')).toBeUndefined();
        expect(CacheService.get<string>('key2')).toBeUndefined();
    });
});