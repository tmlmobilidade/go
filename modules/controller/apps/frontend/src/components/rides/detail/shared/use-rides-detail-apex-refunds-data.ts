'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailApexRefundsDataReturnType {
	data: SimplifiedApexOnBoardRefund[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useRidesDetailApexRefundsData(): UseRidesDetailApexRefundsDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<SimplifiedApexOnBoardRefund[]>>(rideId && API_ROUTES.controller.RIDES_DETAIL_APEX_REFUNDS(rideId), {
		fetcher: async url => await fetchDataNew<SimplifiedApexOnBoardRefund[]>(url),
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
