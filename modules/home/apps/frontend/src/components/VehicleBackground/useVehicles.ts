'use client';

/* * */

import type { Vehicle } from './types';

import useSWR from 'swr';

/* * */

const VEHICLES_API_URL = 'https://api.carrismetropolitana.pt/v2/vehicles';
const MAX_AGE_SECONDS = 2 * 60; // 2 minutes

const fetcher = (url: string): Promise<Vehicle[]> =>
	fetch(url).then(res => res.json());

/* * */

export function useVehicles() {
	const { data, error, isLoading } = useSWR<Vehicle[]>(
		VEHICLES_API_URL,
		fetcher,
		{
			refreshInterval: 5_000, // Refresh every 5 seconds
		},
	);

	// Filter to only include vehicles updated within the last 2 minutes
	const vehicles = (data || []).filter((vehicle) => {
		const nowSeconds = Date.now() / 1000;
		const ageSeconds = nowSeconds - vehicle.timestamp;
		return ageSeconds <= MAX_AGE_SECONDS;
	});

	return {
		isError: !!error,
		isLoading,
		vehicles,
	};
}
