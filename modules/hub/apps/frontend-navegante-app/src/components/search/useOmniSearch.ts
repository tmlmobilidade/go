'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useUserLocation } from '@/components/map/use-user-location';
import { useStopsContext } from '@/components/stops/Stops.context';
import { mapMotisGeocodeResultToLocation, type MotisGeocodeResult, type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { normalizeSearchText } from '@/utils/search';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubAlert, type HubLine, type HubStop } from '@tmlmobilidade/go-types-public-info';
import { useEffect, useMemo, useState } from 'react';

/* * */

export type OmniSearchResult = { entity: HubAlert, id: string, label: string, score: number, type: 'alert' } | { entity: HubLine, id: string, label: string, score: number, type: 'line' } | { entity: HubStop, id: string, label: string, score: number, type: 'stop' } | { entity: RoutePlannerLocation, id: string, label: string, score: number, type: 'poi' };

export interface OmniSearchGroup {
	key: OmniSearchResult['type']
	results: OmniSearchResult[]
}

interface UseOmniSearchResult {
	error: null | string
	groups: OmniSearchGroup[]
	isLoading: boolean
}

interface SearchCoordinates {
	latitude: number
	longitude: number
}

/* * */

const GROUP_TIE_BREAKERS: Record<OmniSearchResult['type'], number> = { alert: 0, line: 1, poi: 3, stop: 2 };
const MOTIS_PLACE_BIAS = 1;
const RESULTS_PER_GROUP = 5;
const DEFAULT_SEARCH_COORDINATES: SearchCoordinates = { latitude: 38.7223, longitude: -9.1393 };

/* * */

export function useOmniSearch(query: string): UseOmniSearchResult {
	//

	// A. Setup variables

	const alertsContext = useAlertsContext();
	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const { userLocation } = useUserLocation();
	const userCoordinates = useMemo(() => getSearchCoordinates(userLocation), [userLocation?.latitude, userLocation?.longitude]);
	const searchBiasCoordinates = userCoordinates ?? DEFAULT_SEARCH_COORDINATES;
	const [poiResults, setPoiResults] = useState<OmniSearchResult[]>([]);
	const [error, setError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(false);
	const normalizedQuery = normalizeSearchText(query).trim();

	//
	// B. Fetch data

	useEffect(() => {
		if (normalizedQuery.length < 2) {
			setPoiResults([]);
			setError(null);
			setIsLoading(false);
			return;
		}

		const abortController = new AbortController();
		const timeout = window.setTimeout(async () => {
			setIsLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({ numResults: '8', text: query.trim(), type: 'PLACE' });
				params.set('place', `${searchBiasCoordinates.latitude},${searchBiasCoordinates.longitude}`);
				params.set('placeBias', String(MOTIS_PLACE_BIAS));
				const response = await fetch(`${API_ROUTES.hub.MOTIS_GEOCODE}?${params.toString()}`, { signal: abortController.signal });
				if (!response.ok) throw new Error(`MOTIS geocode returned HTTP ${response.status}`);
				const payload: { data: unknown } = await response.json();
				const results = Array.isArray(payload.data) ? payload.data.map((item: MotisGeocodeResult) => mapMotisGeocodeResultToLocation(item)) : [];
				const mappedPoiResults = results.map(location => toPoiResult(location, normalizedQuery));
				setPoiResults(mappedPoiResults);
			} catch (caughtError) {
				if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return;
				setPoiResults([]);
				setError(caughtError instanceof Error ? caughtError.message : 'Erro ao pesquisar locais');
			} finally {
				if (!abortController.signal.aborted) setIsLoading(false);
			}
		}, 260);

		return () => {
			abortController.abort();
			window.clearTimeout(timeout);
		};
	}, [normalizedQuery, query, searchBiasCoordinates]);

	//
	// C. Transform data

	const groups = useMemo(() => {
		if (!normalizedQuery) return getAgencyAlertGroup(alertsContext.data.alerts);
		if (normalizedQuery.length < 2) return [];

		const results: OmniSearchResult[] = [
			...alertsContext.data.alerts.map(alert => toResult('alert', alert, `${alert.title} ${alert.description}`, normalizedQuery)),
			...linesContext.data.lines.map(line => toResult('line', line, `${line.short_name} ${line.long_name}`, normalizedQuery)),
			...stopsContext.data.stops.map(stop => toResult('stop', stop, `${stop.name} ${stop.short_name} ${stop.locality_name ?? ''} ${stop.municipality_name}`, normalizedQuery)),
			...poiResults,
		].filter((result): result is OmniSearchResult => result !== null);

		return groupResults(results);
	}, [alertsContext.data.alerts, linesContext.data.lines, normalizedQuery, poiResults, stopsContext.data.stops]);

	return { error, groups, isLoading };
}

/* * */

function toResult<T extends HubAlert | HubLine | HubStop | RoutePlannerLocation>(type: OmniSearchResult['type'], entity: T, searchableText: string, query: string): null | OmniSearchResult {
	const score = getMatchScore(searchableText, query);
	if (score === 0) return null;

	if (type === 'alert') return { entity: entity as HubAlert, id: (entity as HubAlert)._id, label: (entity as HubAlert).title, score, type };
	if (type === 'line') return { entity: entity as HubLine, id: (entity as HubLine)._id, label: (entity as HubLine).long_name, score, type };
	if (type === 'stop') return { entity: entity as HubStop, id: String((entity as HubStop)._id), label: (entity as HubStop).name, score, type };
	return { entity: entity as RoutePlannerLocation, id: (entity as RoutePlannerLocation).id ?? (entity as RoutePlannerLocation).label, label: (entity as RoutePlannerLocation).label, score, type: 'poi' };
}

function toPoiResult(location: RoutePlannerLocation, query: string): Extract<OmniSearchResult, { type: 'poi' }> {
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

function getAgencyAlertGroup(alerts: HubAlert[]): OmniSearchGroup[] {
	const now = Date.now() / 1000;
	const agencyAlerts = alerts
		.filter(alert => alert.reference_type === 'agency' && (!alert.active_period_start_date || alert.active_period_start_date <= now) && (!alert.active_period_end_date || alert.active_period_end_date >= now));
	const highlightedAlerts = agencyAlerts.length
		? agencyAlerts.slice(0, RESULTS_PER_GROUP)
		: [...alerts].sort((a, b) => b.active_period_start_date - a.active_period_start_date).slice(0, 3);
	const results = highlightedAlerts
		.map(alert => ({ entity: alert, id: alert._id, label: alert.title, score: 1, type: 'alert' as const }))
		.slice(0, RESULTS_PER_GROUP);

	return results.length ? [{ key: 'alert', results }] : [];
}

function groupResults(results: OmniSearchResult[]): OmniSearchGroup[] {
	const groups = new Map<OmniSearchResult['type'], OmniSearchResult[]>();
	results.forEach((result) => {
		const current = groups.get(result.type) ?? [];
		current.push(result);
		groups.set(result.type, current);
	});

	return Array.from(groups.entries())
		.map(([key, groupResults]) => ({
			key,
			results: key === 'poi'
				? groupResults.slice(0, RESULTS_PER_GROUP)
				: groupResults.sort(compareResults).slice(0, RESULTS_PER_GROUP),
		}))
		.sort((a, b) => getGroupScore(b) - getGroupScore(a) || GROUP_TIE_BREAKERS[a.key] - GROUP_TIE_BREAKERS[b.key]);
}

function getGroupScore(group: OmniSearchGroup) {
	return Math.max(...group.results.map(result => result.score));
}

function compareResults(a: OmniSearchResult, b: OmniSearchResult) {
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
