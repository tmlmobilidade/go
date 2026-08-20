'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailApexBankingTapsDataReturnType {
	data: SimplifiedApexBankingTap[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useRidesDetailApexBankingTapsData(): UseRidesDetailApexBankingTapsDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<SimplifiedApexBankingTap[]>>(rideId && API_ROUTES.controller.RIDES_DETAIL_APEX_BANKING_TAPS(rideId), {
		fetcher: async url => await fetchApiData<SimplifiedApexBankingTap[]>({ url }),
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
