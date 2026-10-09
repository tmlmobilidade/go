'use client';

import { useAlertsData } from '@/components/alerts/use-alerts-data';
import { useLinesData } from '@/components/lines/use-lines-data';
import { useStopsData } from '@/components/stops/use-stops-data';
import { SEARCH_RESULT_TYPE_ORDER } from '@/constants/search';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { useMotisGeocode } from '@/hooks/search/useMotisGeocode';
import { type RecentSearchEntry, type SearchGroup, type SearchResult } from '@/types/common/search';
import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { normalizeSearchText } from '@/utils/search/normalize';
import { type HubV1ApiAlert, type HubV1ApiLine, type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UseSearchResult {
	error: null | string
	groups: SearchGroup[]
	isLoading: boolean
	isRecentLoading: boolean
	recentResults: SearchResult[]
}

interface SearchCoordinates {
	latitude: number
	longitude: number
}

/* * */

const MOTIS_PLACE_BIAS = 1;
const MOTIS_RESULTS = 10;
const DEFAULT_SEARCH_COORDINATES: SearchCoordinates = { latitude: 38.7223, longitude: -9.1393 };

/* * */

export function useSearch(query: string, recentEntries: RecentSearchEntry[]): UseSearchResult {
	//

	// A. Setup variables

	const { data: alerts, error: alertsError, isLoading: isAlertsLoading } = useAlertsData();
	const { data: lines, error: linesError, isLoading: isLinesLoading } = useLinesData();
	const { data: stops, error: stopsError, isLoading: isStopsLoading } = useStopsData();
	const userLocationContext = useUserLocation();
	const { t } = useTranslation();
	const userCoordinates = useMemo(() => getSearchCoordinates(userLocationContext.data.location), [userLocationContext.data.location?.latitude, userLocationContext.data.location?.longitude]);
	const searchBiasCoordinates = userCoordinates ?? DEFAULT_SEARCH_COORDINATES;
	const normalizedQuery = normalizeSearchText(query).trim();
	const motisSearch = useMotisGeocode(query, {
		errorMessage: t('default:search.Search.error'),
		numResults: MOTIS_RESULTS,
		placeBias: {
			latitude: searchBiasCoordinates.latitude,
			longitude: searchBiasCoordinates.longitude,
			weight: MOTIS_PLACE_BIAS,
		},
		unnamedLocationLabel: t('default:common.locations.unnamed'),
	});

	//
	// C. Transform data

	const groups = useMemo(() => {
		if (!normalizedQuery) return [];
		if (normalizedQuery.length < 2) return [];

		const results: SearchResult[] = [
			...alerts.map(alert => toResult('alert', alert, `${alert.title} ${alert.description}`, normalizedQuery)),
			...lines.map(line => toResult('line', line, `${line.short_name} ${line.long_name}`, normalizedQuery)),
			...stops.map(stop => toResult('stop', stop, `${stop.name} ${stop.short_name} ${stop.locality_name ?? ''} ${stop.municipality_name}`, normalizedQuery)),
			...motisSearch.data.map(location => toPoiResult(location, normalizedQuery)),
		].filter((result): result is SearchResult => result !== null);

		return groupResults(results);
	}, [alerts, lines, motisSearch.data, normalizedQuery, stops]);

	const recentResults = useMemo(() => recentEntries.flatMap((entry): SearchResult[] => {
		if (entry.type === 'poi') return [{ entity: entry.location, id: entry.id, label: entry.location.label, score: 0, type: 'poi' }];
		if (entry.type === 'alert') {
			const alert = alerts.find(item => item._id === entry.id);
			return alert ? [{ entity: alert, id: entry.id, label: alert.title, score: 0, type: 'alert' }] : [];
		}
		if (entry.type === 'line') {
			const line = lines.find(item => item._id === entry.id);
			return line ? [{ entity: line, id: entry.id, label: line.long_name, score: 0, type: 'line' }] : [];
		}
		const stop = stops.find(item => String(item._id) === entry.id);
		return stop ? [{ entity: stop, id: entry.id, label: stop.name, score: 0, type: 'stop' }] : [];
	}), [alerts, lines, recentEntries, stops]);

	const hasSearchQuery = normalizedQuery.length >= 2;
	const hasLocalDataError = Boolean(alertsError || linesError || stopsError);
	const error = hasSearchQuery ? motisSearch.error || (hasLocalDataError ? t('default:search.Search.error') : null) : null;
	const isLoading = hasSearchQuery && (motisSearch.isLoading || isAlertsLoading || isLinesLoading || isStopsLoading);
	const isRecentLoading = recentEntries.some(entry => (entry.type === 'alert' && isAlertsLoading) || (entry.type === 'line' && isLinesLoading) || (entry.type === 'stop' && isStopsLoading));

	return { error, groups, isLoading, isRecentLoading, recentResults };
}

/* * */

function toResult<T extends HubV1ApiAlert | HubV1ApiLine | HubV1ApiStop | RoutePlannerLocation>(type: SearchResult['type'], entity: T, searchableText: string, query: string): null | SearchResult {
	const score = getMatchScore(searchableText, query);
	if (score === 0) return null;

	if (type === 'alert') return { entity: entity as HubV1ApiAlert, id: (entity as HubV1ApiAlert)._id, label: (entity as HubV1ApiAlert).title, score, type };
	if (type === 'line') return { entity: entity as HubV1ApiLine, id: (entity as HubV1ApiLine)._id, label: (entity as HubV1ApiLine).long_name, score, type };
	if (type === 'stop') return { entity: entity as HubV1ApiStop, id: String((entity as HubV1ApiStop)._id), label: (entity as HubV1ApiStop).name, score, type };
	return { entity: entity as RoutePlannerLocation, id: (entity as RoutePlannerLocation).id ?? (entity as RoutePlannerLocation).label, label: (entity as RoutePlannerLocation).label, score, type: 'poi' };
}

function toPoiResult(location: RoutePlannerLocation, query: string): Extract<SearchResult, { type: 'poi' }> {
	const searchableText = `${location.label} ${location.detail} ${location.street ?? ''}`;
	const groupScore = getMatchScore(searchableText, query) || 200;

	return {
		entity: location,
		id: location.id ?? location.label,
		label: location.label,
		score: groupScore,
		type: 'poi',
	};
}

function groupResults(results: SearchResult[]): SearchGroup[] {
	const groups = new Map<SearchResult['type'], SearchResult[]>();
	results.forEach((result) => {
		const current = groups.get(result.type) ?? [];
		current.push(result);
		groups.set(result.type, current);
	});

	return Array.from(groups.entries())
		.map(([key, groupResults]) => {
			return {
				key,
				results: key === 'poi'
					? groupResults
					: groupResults.sort(compareResults),
			};
		})
		.sort((a, b) => SEARCH_RESULT_TYPE_ORDER.indexOf(a.key) - SEARCH_RESULT_TYPE_ORDER.indexOf(b.key));
}

function compareResults(a: SearchResult, b: SearchResult) {
	if (b.score !== a.score) return b.score - a.score;
	return a.label.localeCompare(b.label);
}

function getSearchCoordinates(userLocation: null | Partial<SearchCoordinates>): null | SearchCoordinates {
	if (!Number.isFinite(userLocation?.latitude) || !Number.isFinite(userLocation?.longitude)) return null;
	return { latitude: userLocation.latitude, longitude: userLocation.longitude };
}

function getMatchScore(value: string, query: string) {
	const normalizedValue = normalizeSearchText(value).trim();
	if (normalizedValue === query) return 1_000;
	if (normalizedValue.startsWith(query)) return 800;
	const queryTokens = query.split(' ').filter(Boolean);
	const valueTokens = normalizedValue.split(/\s+/);
	if (queryTokens.every(token => valueTokens.some(valueToken => valueToken.startsWith(token)))) return 600;
	if (normalizedValue.includes(query)) return 400;
	return 0;
}
