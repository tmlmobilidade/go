'use client';

import { useStopsContext } from '@/components/stops/Stops.context';
import { mapMotisGeocodeResultToLocation, type MotisGeocodeResult, routePlannerCoordinateToLocation, type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubStop } from '@tmlmobilidade/go-types-public-info';
import { useEffect, useMemo, useState } from 'react';

/* * */

interface UseMotisLocationSearchResult {
	data: RoutePlannerLocation[]
	error: null | string
	isLoading: boolean
}

/* * */

export function useMotisLocationSearch(query: string): UseMotisLocationSearchResult {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const [data, setData] = useState<RoutePlannerLocation[]>([]);
	const [error, setError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(false);
	const localStopResults = useMemo(() => searchStops(stopsContext.data.stops, query), [query, stopsContext.data.stops]);

	//
	// B. Fetch data

	useEffect(() => {
		const trimmedQuery = query.trim();
		const coordinateLocation = routePlannerCoordinateToLocation(trimmedQuery);

		if (coordinateLocation) {
			setData([coordinateLocation]);
			setError(null);
			setIsLoading(false);
			return;
		}

		if (trimmedQuery.length < 2) {
			setData([]);
			setError(null);
			setIsLoading(false);
			return;
		}

		const abortController = new AbortController();
		const timeout = window.setTimeout(async () => {
			const params = new URLSearchParams({
				numResults: '8',
				text: trimmedQuery,
				type: 'PLACE',
			});

			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(`${API_ROUTES.hub.MOTIS_GEOCODE}?${params.toString()}`, {
					signal: abortController.signal,
				});

				if (!response.ok) throw new Error(`MOTIS geocode returned HTTP ${response.status}`);

				const payload: { data: unknown } = await response.json();
				const mappedResults = Array.isArray(payload.data)
					? payload.data.map((result: MotisGeocodeResult) => mapMotisGeocodeResultToLocation(result))
					: [];

				setData([...localStopResults, ...mappedResults]);
			} catch (caughtError) {
				if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return;
				const message = caughtError instanceof Error ? caughtError.message : 'Erro ao pesquisar localizações';
				setData(localStopResults);
				setError(localStopResults.length > 0 ? null : message);
			} finally {
				if (!abortController.signal.aborted) setIsLoading(false);
			}
		}, 260);

		return () => {
			abortController.abort();
			window.clearTimeout(timeout);
		};
	}, [localStopResults, query]);

	//
	// C. Return values

	return { data, error, isLoading };

	//
}

/* * */

function searchStops(stops: HubStop[], query: string): RoutePlannerLocation[] {
	const normalizedQuery = normalizeSearchText(query);
	if (normalizedQuery.length < 2) return [];

	return stops
		.filter(stop => normalizeSearchText(`${stop.name} ${stop.short_name} ${stop.locality_name ?? ''} ${stop.municipality_name}`).includes(normalizedQuery))
		.slice(0, 8)
		.map(stop => ({
			detail: [stop.locality_name, stop.municipality_name].filter(Boolean).join(' | '),
			id: String(stop._id),
			label: stop.name,
			lat: stop.latitude,
			lon: stop.longitude,
			type: 'STOP',
		}));
}

function normalizeSearchText(value: string) {
	return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
}
