import type { TripStopEta } from '../types.js';

type EtaKey = `hub:v1:${string}:realtime:eta:${string}`;
interface EtaCache {
	deleteMany: (keys: string[]) => Promise<unknown>
	scan: (pattern: string) => Promise<string[]>
	set: (key: EtaKey, value: string, ttl: number) => Promise<unknown>
}

/** Replace all three simplified representations from the same read. Delete
 * missing groups only after every write succeeds. Keep work bounded to 25 I/O
 * operations; SCAN and deletion are restricted to this agency's two prefixes.
 * One publisher owns an agency at a time, as with the existing worker. */
export async function writeEtaSnapshot(cache: EtaCache, agencyId: string, rows: TripStopEta[], ttl: number): Promise<void> {
	const prefix = `hub:v1:${agencyId}:realtime:eta` as const;
	const groups = new Map<EtaKey, TripStopEta[]>();
	for (const row of rows) {
		for (const key of [`${prefix}:by-trip:${row.trip_id}`, `${prefix}:by-stop:${row.stop_id}`] as const) {
			const group = groups.get(key) ?? [];
			group.push(row);
			groups.set(key, group);
		}
	}
	const entries = [...groups];
	for (let offset = 0; offset < entries.length; offset += 25) {
		await Promise.all(entries.slice(offset, offset + 25).map(([key, group]) => {
			group.sort((a, b) => a.stop_sequence - b.stop_sequence);
			return cache.set(key, JSON.stringify(group), ttl);
		}));
	}
	await cache.set(`${prefix}:all`, JSON.stringify(rows), ttl);
	for (const kind of ['by-stop', 'by-trip']) {
		const scope = `${prefix}:${kind}:`;
		const keys = await cache.scan(`${scope}*`);
		const stale = keys.filter(key => key.startsWith(scope) && !groups.has(key as EtaKey));
		for (let offset = 0; offset < stale.length; offset += 1000) {
			await cache.deleteMany(stale.slice(offset, offset + 1000));
		}
	}
}
