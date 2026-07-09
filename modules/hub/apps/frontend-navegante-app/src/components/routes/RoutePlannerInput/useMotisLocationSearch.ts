'use client';

import { buildMotisProxyUrl, mapMotisGeocodeResultToLocation, type MotisGeocodeResult, routePlannerCoordinateToLocation, type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { useEffect, useState } from 'react';

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

	const [data, setData] = useState<RoutePlannerLocation[]>([]);
	const [error, setError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(false);

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
				type: 'STOP,ADDRESS,PLACE',
			});

			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(buildMotisProxyUrl('/api/v1/geocode', params), {
					signal: abortController.signal,
				});

				if (!response.ok) throw new Error(`MOTIS geocode returned HTTP ${response.status}`);

				const results: unknown = await response.json();
				const mappedResults = Array.isArray(results)
					? results.map((result: MotisGeocodeResult) => mapMotisGeocodeResultToLocation(result))
					: [];

				setData(mappedResults);
			} catch (caughtError) {
				if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return;
				const message = caughtError instanceof Error ? caughtError.message : 'Erro ao pesquisar localizações';
				setData([]);
				setError(message);
			} finally {
				if (!abortController.signal.aborted) setIsLoading(false);
			}
		}, 260);

		return () => {
			abortController.abort();
			window.clearTimeout(timeout);
		};
	}, [query]);

	//
	// C. Return values

	return { data, error, isLoading };

	//
}
