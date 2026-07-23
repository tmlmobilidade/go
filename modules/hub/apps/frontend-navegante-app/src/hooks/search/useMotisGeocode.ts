'use client';

import { type MotisGeocodeResult, type RoutePlannerLocation } from '@/types/route-planner/models';
import { mapMotisGeocodeResultToLocation } from '@/utils/search/motis-geocode';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { useEffect, useState } from 'react';

/* * */

interface MotisGeocodePlaceBias {
	latitude: number
	longitude: number
	weight: number
}

interface UseMotisGeocodeOptions {
	enabled?: boolean
	errorMessage: string
	placeBias?: MotisGeocodePlaceBias
	unnamedLocationLabel: string
}

interface UseMotisGeocodeResult {
	data: RoutePlannerLocation[]
	error: null | string
	isLoading: boolean
}

/* * */

export function useMotisGeocode(query: string, options: UseMotisGeocodeOptions): UseMotisGeocodeResult {
	//

	//
	// A. Setup variables

	const [data, setData] = useState<RoutePlannerLocation[]>([]);
	const [error, setError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(false);

	const enabled = options.enabled ?? true;
	const placeBiasLatitude = options.placeBias?.latitude;
	const placeBiasLongitude = options.placeBias?.longitude;
	const placeBiasWeight = options.placeBias?.weight;

	//
	// B. Fetch data

	useEffect(() => {
		const trimmedQuery = query.trim();

		if (!enabled || trimmedQuery.length < 2) {
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

			if (Number.isFinite(placeBiasLatitude) && Number.isFinite(placeBiasLongitude) && Number.isFinite(placeBiasWeight)) {
				params.set('place', `${placeBiasLatitude},${placeBiasLongitude}`);
				params.set('placeBias', String(placeBiasWeight));
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(`${API_ROUTES.hub.MOTIS_GEOCODE}?${params.toString()}`, {
					signal: abortController.signal,
				});

				if (!response.ok) throw new Error(`MOTIS geocode returned HTTP ${response.status}`);

				const payload: { data: unknown } = await response.json();
				const mappedResults = Array.isArray(payload.data)
					? payload.data.map((result: MotisGeocodeResult) => mapMotisGeocodeResultToLocation(result, options.unnamedLocationLabel))
					: [];

				setData(mappedResults);
			} catch (caughtError) {
				if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return;
				// eslint-disable-next-line no-console
				console.error(caughtError);
				setData([]);
				setError(options.errorMessage);
			} finally {
				if (!abortController.signal.aborted) setIsLoading(false);
			}
		}, 260);

		return () => {
			abortController.abort();
			window.clearTimeout(timeout);
		};
	}, [enabled, options.errorMessage, options.unnamedLocationLabel, placeBiasLatitude, placeBiasLongitude, placeBiasWeight, query]);

	//
	// C. Return values

	return { data, error, isLoading };

	//
}
