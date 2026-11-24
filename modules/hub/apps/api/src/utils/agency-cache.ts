/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

export type AgencyCacheSuffix = `agencies:${string}` | `alerts:${string}` | `network:${string}` | `plans:${string}` | `realtime:eta:${string}` | `realtime:vehicles:${string}`;

/** Read agency keys only, unwrapping entries written with setNew. */
export async function readAgencyCache<T>(agencyIds: string[], suffix: AgencyCacheSuffix): Promise<{ data: T, timestamp?: UnixMilliseconds }[]> {
	const values = await Promise.all([...new Set(agencyIds)].map(async (agencyId) => {
		const raw = await cacheDb.get(`hub:v1:${agencyId}:${suffix}`);
		if (raw === null) return undefined;
		const value = JSON.parse(raw);
		return value && typeof value === 'object' && 'data' in value && 'timestamp' in value
			? value as { data: T, timestamp: UnixMilliseconds }
			: { data: value as T, timestamp: undefined };
	}));
	return values.filter(value => value !== undefined);
}

/** Merge references for physical stops shared by several agencies. */
export function mergeStops(stops: HubV1ApiStop[]): HubV1ApiStop[] {
	const merged = new Map<string, HubV1ApiStop>();
	for (const stop of stops) {
		const previous = merged.get(stop._id);
		if (!previous) {
			merged.set(stop._id, { ...stop });
			continue;
		}
		for (const key of ['agency_ids', 'line_ids', 'route_ids', 'pattern_ids', 'legacy_ids'] as const) {
			previous[key] = [...new Set([...previous[key], ...stop[key]])];
		}
		previous.flags = [...new Map([...previous.flags, ...stop.flags].map(flag => [JSON.stringify(flag), flag])).values()];
	}
	return [...merged.values()];
}

/** Retain agency-local GTFS entity IDs without collisions in the merged feed. */
export function mergeGtfsFeeds(feeds: GtfsRtFeedMessage[], agencyIds: string[]): GtfsRtFeedMessage {
	return {
		entity: feeds.flatMap((feed, index) => feed.entity.map(entity => ({ ...entity, id: `${agencyIds[index]}:${entity.id}` }))),
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: feeds.length ? feeds.reduce((oldest, feed) => feed.header.timestamp < oldest ? feed.header.timestamp : oldest, feeds[0].header.timestamp) : Dates.now('utc').unix_seconds,
		},
	};
}

/** Preserve the oldest available generation time of a merged response. */
export function oldestCacheTimestamp(entries: { timestamp?: UnixMilliseconds }[]): undefined | UnixMilliseconds {
	return entries.flatMap(entry => entry.timestamp === undefined ? [] : [entry.timestamp]).sort((a, b) => a - b)[0];
}
