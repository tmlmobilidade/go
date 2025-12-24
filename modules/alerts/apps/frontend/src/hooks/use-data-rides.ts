'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type GetRidesBatchQuery, type Ride, type RideNormalized } from '@tmlmobilidade/types';
import { type SelectDataItem, useDebouncedValue } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export type RidesData = Ride & { stop_ids: string[] };

interface UseDataRidesProps {
	filters?: GetRidesBatchQuery
}

interface UseDataRidesReturnType {
	error: Error | undefined
	isLoading: boolean
	options: SelectDataItem[]
	raw: RideNormalized[]
}

/* * */

export function useDataRides({ filters }: UseDataRidesProps): UseDataRidesReturnType {
	//

	//
	// A. Setup variables

	const [debouncedFilterSearch] = useDebouncedValue(filters?.search?.trim() ?? '', 500);

	//
	// B. Fetch data

	const { data: ridesData, error: ridesError, isLoading: ridesLoading } = useSWR<RideNormalized[], Error>(`${API_ROUTES.alerts.RIDES_LIST}?search=${debouncedFilterSearch}&lines=${filters?.line_ids?.join(',')}&stops=${filters?.stop_ids?.join(',')}`);

	//
	// C. Transform data

	const optionsData = useMemo(() => {
		if (!ridesData) return [];
		return ridesData.map(ride => ({
			label: ride.headsign,
			value: ride.trip_id,
		}));
	}, [ridesData]);

	//
	// D. Return data

	return {
		error: ridesError,
		isLoading: ridesLoading,
		options: optionsData,
		raw: ridesData ?? [],
	};

	//
};
