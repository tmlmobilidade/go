'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ControllerRidesDetailRideAnalysesItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailRideAnalysesDataReturnType {
	data: ControllerRidesDetailRideAnalysesItem
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useRidesDetailRideAnalysesData(): UseRidesDetailRideAnalysesDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	const [timestamp, setTimestamp] = useState<null | UnixTimestamp>(null);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ControllerRidesDetailRideAnalysesItem>(rideId && API_ROUTES.controller.RIDES_DETAIL_ANALYSES(rideId), {
		fetcher: async (url) => {
			const response = await fetchDataNew<ControllerRidesDetailRideAnalysesItem>(url);
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
