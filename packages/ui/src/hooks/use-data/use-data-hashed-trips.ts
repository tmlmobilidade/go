'use client';

import { type GetRidesBatchQuery, type HashedTrip, type UnixTimestamp } from '@tmlmobilidade/types';
import { type SelectDataItem, useDebouncedState } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseDataHashedTripsProps {
	filters: GetRidesBatchQuery
}

/* * */

interface UseDataHashedTripsReturnType {
	error: Error | undefined
	isLoading: boolean
	lastUpdatedAt: null | UnixTimestamp
	options: SelectDataItem[]
	raw: HashedTrip[]
}

/* * */

export function useDataHashedTrips(apiUrl: string, props?: UseDataHashedTripsProps): UseDataHashedTripsReturnType {
	//

	//
	// A. Setup variables

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	//
	// B. Fetch data

	const { data: fetchedHashedTripsData, error: fetchedHashedTripsError, isLoading: fetchedHashedTripsLoading } = useSWR<HashedTrip[], Error>((apiUrl && queryStringParams) && `${apiUrl}?${queryStringParams}`);

	//
	// C. Transform data

	useEffect(() => {
		// Skip if no filters are set
		if (!props?.filters) return;
		// Skip if required filters are missing
		if (!props.filters.date_start) return;
		if (!props.filters.date_end) return;
		if (!props.filters.agency_ids?.length) return;
		// Parse filters into a query string format
		const filtersMap = Object
			.entries(props.filters)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)]);
		// Build query string params and set state
		const result = new URLSearchParams(Object.fromEntries(filtersMap)).toString();
		setQueryStringParams(result);
	}, [
		props?.filters?.search,
		props?.filters?.agency_ids,
		props?.filters?.date_start,
		props?.filters?.date_end,
		props?.filters?.acceptance_status,
		props?.filters?.analysis_ended_at_last_stop_grade,
		props?.filters?.analysis_expected_apex_validation_interval,
		props?.filters?.analysis_simple_three_vehicle_events_grade,
		props?.filters?.analysis_transaction_sequentiality,
		props?.filters?.delay_statuses,
		props?.filters?.operational_statuses,
	]);

	const optionsData = useMemo(() => {
		if (!fetchedHashedTripsData) return [];
		return fetchedHashedTripsData.map(item => ({
			label: item.route_long_name,
			value: item._id,
		}));
		const uniqueLinesMap = new Map<number, string>();
		fetchedHashedTripsData.forEach((item) => {
			if (uniqueLinesMap.has(item.line_id)) return;
			uniqueLinesMap.set(item.line_id, `[${item.line_short_name}] ${item.line_long_name}`);
		});
		return Array.from(uniqueLinesMap, ([value, label]) => ({ label, value: String(value) }));
	}, [fetchedHashedTripsData]);
	//
	// D. Return data

	return {
		error: fetchedHashedTripsError,
		isLoading: fetchedHashedTripsLoading,
		lastUpdatedAt: null,
		options: optionsData,
		raw: fetchedHashedTripsData ?? [],
	};

	//
};
