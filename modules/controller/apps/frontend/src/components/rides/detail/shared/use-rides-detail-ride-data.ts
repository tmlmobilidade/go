'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ControllerRidesDetailRideItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo, useState } from 'react';
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

	const [timestamp, setTimestamp] = useState<null | UnixTimestamp>(null);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ControllerRidesDetailRideItem>(API_ROUTES.controller.RIDES_DETAIL_RIDE(rideId), {
		fetcher: async (url) => {
			const response = await fetchDataNew<ControllerRidesDetailRideItem>(url);
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
