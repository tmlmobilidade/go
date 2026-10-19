'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useVehiclesDetailVehicleId } from './use-vehicles-detail-vehicle-id';

/* * */

interface UseVehiclesDetailDataReturnType {
	data: Vehicle
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Vehicle>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useVehiclesDetailData(): UseVehiclesDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { vehicleId } = useVehiclesDetailVehicleId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Vehicle>>(API_ROUTES.operation.VEHICLES_DETAIL(vehicleId), {
		fetcher: async (url: string) => await fetchApiData<Vehicle>({ url }),
		refreshInterval: 5_000,
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
};
