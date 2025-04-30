// Testes unitários para o CacheService, verificando operações básicas de cache como set, get, del e flush.

import CacheService from '../src/services/CacheService';

const TEST_KEY = 'testKey';
const TEST_VALUE = 'testValue';
const NON_EXISTENT_KEY = 'nonExistentKey';
const KEY1 = 'key1';
const VALUE1 = 'value1';
const KEY2 = 'key2';
const VALUE2 = 'value2';

describe('CacheService', () => {
    beforeEach(() => {
        CacheService.flush();
    });

    it('should store and retrieve data from the cache', () => {
        CacheService.set(TEST_KEY, TEST_VALUE);
        const value = CacheService.get<string>(TEST_KEY);
        expect(value).toBe(TEST_VALUE);
    });

    it('should return undefined for non-existent keys', () => {
        const value = CacheService.get<string>(NON_EXISTENT_KEY);
        expect(value).toBeUndefined();
    });

    it('should delete a key from the cache', () => {
        CacheService.set(TEST_KEY, TEST_VALUE);
        CacheService.del(TEST_KEY);
        const value = CacheService.get<string>(TEST_KEY);
        expect(value).toBeUndefined();
    });

    it('should flush all keys from the cache', () => {
        CacheService.set(KEY1, VALUE1);
        CacheService.set(KEY2, VALUE2);
        CacheService.flush();
        expect(CacheService.get<string>(KEY1)).toBeUndefined();
        expect(CacheService.get<string>(KEY2)).toBeUndefined();
    });

    it('should handle deletion of non-existent keys gracefully', () => {
        expect(() => CacheService.del(NON_EXISTENT_KEY)).not.toThrow();
    });
});