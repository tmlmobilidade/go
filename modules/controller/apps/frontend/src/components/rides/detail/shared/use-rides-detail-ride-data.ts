'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ControllerRidesDetailRideItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailRideDataReturnType {
	data: ControllerRidesDetailRideItem
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useRidesDetailRideData(): UseRidesDetailRideDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<ControllerRidesDetailRideItem>>(rideId && API_ROUTES.controller.RIDES_DETAIL_RIDE(rideId), {
		fetcher: async url => await fetchDataNew<ControllerRidesDetailRideItem>(url),
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
