'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useVehiclesDetailVehicleId } from './use-vehicles-detail-vehicle-id';

/* * */

interface UseVehiclesDetailPositionDataReturnType {
	data: SimplifiedVehicleEvent
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixMilliseconds
}

/* * */

export function useVehiclesDetailPositionData(): UseVehiclesDetailPositionDataReturnType {
	//

	//
	// A. Setup variables

	const { vehicleId } = useVehiclesDetailVehicleId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<SimplifiedVehicleEvent>>(API_ROUTES.operation.VEHICLES_DETAIL_LAST_EVENT(vehicleId), {
		fetcher: async (url: string) => await fetchApiData<SimplifiedVehicleEvent>({ url }),
		refreshInterval: 1_000,
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating]);
};
