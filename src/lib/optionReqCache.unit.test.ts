import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OptionRequestCache } from './optionReqCache'
import { Option } from './option'

describe('optionReqCache.ts', () => {
    let cache: OptionRequestCache<string, string>

    beforeEach(() => {
        cache = new OptionRequestCache()
    })

    describe('get', () => {
        it('should return cached Option if present (happyPath)', async () => {
            // Arrange
            const key = 'key1'
            const cachedOption = Option.Some('cachedValue')
            cache['cache'].set(key, cachedOption)
            const fetcher = vi.fn()
            // Act
            const result = await cache.get(key, fetcher)
            // Assert
            expect(result).toBe(cachedOption)
            expect(fetcher).not.toHaveBeenCalled()
        })

        it('should return inFlight Promise if present (happyPath)', async () => {
            // Arrange
            const key = 'key2'
            const promiseOption = Promise.resolve(Option.Some('inFlightValue'))
            cache['inflight'].set(key, promiseOption)
            const fetcher = vi.fn()
            // Act
            const result = await cache.get(key, fetcher)
            // Assert
            expect(result).toBe(await promiseOption)
            expect(fetcher).not.toHaveBeenCalled()
        })

        it('should call fetcher, cache result, and return Option (happyPath)', async () => {
            // Arrange
            const key = 'key3'
            const optionValue = Option.Some('fetchedValue')
            const fetcher = vi.fn().mockResolvedValue(optionValue)
            // Act
            const result = await cache.get(key, fetcher)
            // Assert
            expect(fetcher).toHaveBeenCalledOnce()
            expect(result).toBe(optionValue)
            expect(cache['cache'].get(key)).toBe(optionValue)
            expect(cache['inflight'].has(key)).toBe(false)
        })

        it('если ошибка то возвращает None и не кэширует это (asyncCase)', async () => {
            // Arrange
            const key = 'key4'
            const fetcher = vi.fn().mockRejectedValue(new Error('fail'))
            // Act
            const result = await cache.get(key, fetcher)
            // Assert
            expect(fetcher).toHaveBeenCalledOnce()
            expect(result.isNone()).toBe(true)
            expect(cache['cache'].has(key)).toBe(false)
            expect(cache['inflight'].has(key)).toBe(false)
        })

        it('should remove inFlight entry after fetcher finishes (happyPath)', async () => {
            // Arrange
            const key = 'key5'
            const optionValue = Option.Some('value')
            const fetcher = vi.fn().mockResolvedValue(optionValue)
            // Act
            const promise = cache.get(key, fetcher)
            expect(cache['inflight'].has(key)).toBe(true)
            await promise
            expect(cache['inflight'].has(key)).toBe(false)
        })
    })

    describe('clear', () => {
        it('should clear cache and inflight maps (happyPath)', () => {
            // Arrange
            cache['cache'].set('a', Option.Some('1'))
            cache['inflight'].set('b', Promise.resolve(Option.Some('2')))
            // Act
            cache.clear()
            // Assert
            expect(cache['cache'].size).toBe(0)
            expect(cache['inflight'].size).toBe(0)
        })
    })

    describe('delete', () => {
        it('should delete key from cache and inflight (happyPath)', () => {
            // Arrange
            const key = 'key1'
            cache['cache'].set(key, Option.Some('value'))
            cache['inflight'].set(key, Promise.resolve(Option.Some('value')))
            // Act
            cache.delete(key)
            // Assert
            expect(cache['cache'].has(key)).toBe(false)
            expect(cache['inflight'].has(key)).toBe(false)
        })
    })
})
