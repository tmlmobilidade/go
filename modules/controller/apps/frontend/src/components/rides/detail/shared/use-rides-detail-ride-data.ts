'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type ControllerRidesDetailRideItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { useRidesDetailRideId } from './use-rides-detail-ride-id';

/* * */

interface UseRidesDetailRideDataReturnType {
	data: ControllerRidesDetailRideItem
	error: null | string
	isLoading: boolean
	isValidating: boolean
	lastUpdatedAt: null | UnixTimestamp
}

/* * */

export function useRidesDetailRideData(): UseRidesDetailRideDataReturnType {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();

	const [lastUpdatedAt, setLastUpdatedAt] = useState<null | UnixTimestamp>(null);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ControllerRidesDetailRideItem>(API_ROUTES.controller.RIDES_DETAIL_RIDE(rideId), {
		onSuccess: () => {
			const now = Dates.now('local').unix_timestamp;
			setLastUpdatedAt(now);
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
		lastUpdatedAt,
	}), [data, error, isLoading, isValidating, lastUpdatedAt]);
};
