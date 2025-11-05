// cache.ts
interface CacheEntry<T> {
	expiresAt: number
	value: T
}

export class Cache<K, V> {
	private store = new Map<K, CacheEntry<V>>();

	constructor(private ttlMs: number) {}

	delete(key: K) {
		this.store.delete(key);
	}

	get(key: K): null | V {
		const entry = this.store.get(key);
		if (!entry) return null;
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}
		return entry.value;
	}

	set(key: K, value: V) {
		this.store.set(key, { expiresAt: Date.now() + this.ttlMs, value });
	}
}
