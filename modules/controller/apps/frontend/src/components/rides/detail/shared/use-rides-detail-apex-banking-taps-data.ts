'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo, useState } from 'react';
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

	const [timestamp, setTimestamp] = useState<null | UnixTimestamp>(null);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<SimplifiedApexBankingTap[]>(rideId && API_ROUTES.controller.RIDES_DETAIL_APEX_BANKING_TAPS(rideId), {
		fetcher: async (url) => {
			const response = await fetchDataNew<SimplifiedApexBankingTap[]>(url);
			setTimestamp(response.timestamp);
			return response.data;
		},
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Return data

	return useMemo(() => ({
		data,
		error,
		isLoading,
		isValidating,
		timestamp,
	}), [data, error, isLoading, isValidating, timestamp]);
};
