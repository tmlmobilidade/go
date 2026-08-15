'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailApexSalesDataReturnType {
	data: SimplifiedApexOnBoardSale[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useRidesDetailApexSalesData(): UseRidesDetailApexSalesDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<SimplifiedApexOnBoardSale[]>>(rideId && API_ROUTES.controller.RIDES_DETAIL_APEX_SALES(rideId), {
		fetcher: async url => await fetchDataNew<SimplifiedApexOnBoardSale[]>(url),
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
