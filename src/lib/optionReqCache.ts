import { Option } from './option'

export class OptionRequestCache<K, V> {
    private cache = new Map<K, Option<V>>()
    private inflight = new Map<K, Promise<Option<V>>>()

    async get(key: K, fetcher: () => Promise<Option<V>>): Promise<Option<V>> {
        const cached = this.cache.get(key)
        if (cached) return cached

        const inFlight = this.inflight.get(key)
        if (inFlight) return inFlight

        const req = Promise.resolve()
            .then(() => fetcher())
            .then((opt) => {
                this.cache.set(key, opt)
                return opt
            })
            .catch(() => Option.None())
            .finally(() => {
                this.inflight.delete(key)
            })

        this.inflight.set(key, req)
        return req
    }

    clear() {
        this.cache.clear()
        this.inflight.clear()
    }

    delete(key: K) {
        this.cache.delete(key)
        this.inflight.delete(key)
    }
}
