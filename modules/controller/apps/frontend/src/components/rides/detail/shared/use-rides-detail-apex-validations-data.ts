'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailApexValidationsDataReturnType {
	data: SimplifiedApexValidation[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useRidesDetailApexValidationsData(): UseRidesDetailApexValidationsDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<SimplifiedApexValidation[]>>(rideId && API_ROUTES.controller.RIDES_DETAIL_APEX_VALIDATIONS(rideId), {
		fetcher: async (url: string) => await fetchApiData<SimplifiedApexValidation[]>({ url }),
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
