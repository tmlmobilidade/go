'use client';

import { usePersistedPreference } from '@/hooks/persistence/usePersistedPreference';
import { type RecentSearchEntry, type SearchResult } from '@/types/common/search';
import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { toPersistedRouteLocation } from '@/utils/persistence/app-state';
import { useCallback, useMemo } from 'react';

/* * */

interface UseRecentSearchesReturnType {
	add: (result: SearchResult) => void
	clear: () => void
	clearLocations: () => void
	entries: RecentSearchEntry[]
	isReady: boolean
}

const STORAGE_KEY = 'navegante:recent-searches:v1';
const MAX_RECENT_SEARCHES = 10;
const EMPTY_RECENT_SEARCHES: RecentSearchEntry[] = [];

/* * */

export function useRecentSearches(): UseRecentSearchesReturnType {
	const [entries, setEntries, isReady] = usePersistedPreference(STORAGE_KEY, EMPTY_RECENT_SEARCHES, parseRecentSearches);

	const add = useCallback((result: SearchResult) => {
		const entry = toRecentSearchEntry(result);
		if (!entry) return;
		setEntries(current => [entry, ...current.filter(item => item.type !== entry.type || item.id !== entry.id)].slice(0, MAX_RECENT_SEARCHES));
	}, [setEntries]);

	const clear = useCallback(() => setEntries([]), [setEntries]);
	const clearLocations = useCallback(() => setEntries(current => current.filter(entry => entry.type !== 'poi' && entry.type !== 'stop')), [setEntries]);

	return useMemo(() => ({ add, clear, clearLocations, entries, isReady }), [add, clear, clearLocations, entries, isReady]);
}

/* * */

function toRecentSearchEntry(result: SearchResult): null | RecentSearchEntry {
	if (result.type !== 'poi') return { id: result.id, type: result.type };

	const location = toPersistedRouteLocation(result.entity);
	return location ? { id: result.id, location, type: 'poi' } : null;
}

function parseRecentSearches(value: string): RecentSearchEntry[] {
	const parsed: unknown = JSON.parse(value);
	if (!Array.isArray(parsed)) return [];

	const entries: RecentSearchEntry[] = [];
	const seen = new Set<string>();
	for (const item of parsed) {
		if (!isRecord(item) || typeof item.id !== 'string' || !item.id || item.id.length > 300) continue;
		let entry: null | RecentSearchEntry = null;
		if (item.type === 'poi') {
			const location = toPersistedRouteLocation(item.location as RoutePlannerLocation);
			if (location) entry = { id: item.id, location, type: 'poi' };
		} else if (item.type === 'alert' || item.type === 'line' || item.type === 'stop') {
			entry = { id: item.id, type: item.type };
		}
		if (!entry || seen.has(`${entry.type}:${entry.id}`)) continue;
		seen.add(`${entry.type}:${entry.id}`);
		entries.push(entry);
		if (entries.length === MAX_RECENT_SEARCHES) break;
	}

	return entries;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
