'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HashedTrip } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailHashedTripDataReturnType {
	data: HashedTrip[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixMilliseconds
}

/* * */

export function useRidesDetailHashedTripData(): UseRidesDetailHashedTripDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<HashedTrip[]>>(rideId && API_ROUTES.operation.RIDES_DETAIL_HASHED_TRIP(rideId), {
		fetcher: async (url: string) => await fetchApiData<HashedTrip[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};
