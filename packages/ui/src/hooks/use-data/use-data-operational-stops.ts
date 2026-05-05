'use client';

/* * */

import { useDebouncedState } from '@mantine/hooks';
import { type GetOperationalStopsBatchQuery, type OperationalStop, type UnixTimestamp } from '@tmlmobilidade/types';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../../components/inputs/Select';

/* * */

interface UseDataOperationalStopsProps {
	filters: GetOperationalStopsBatchQuery
}

/* * */

interface UseDataOperationalStopsReturnType {
	error: Error | undefined
	isLoading: boolean
	lastUpdatedAt: null | UnixTimestamp
	options: SelectDataItem[]
	raw: OperationalStop[]
}

/* * */

export function useDataOperationalStops(apiUrl: string, props?: UseDataOperationalStopsProps): UseDataOperationalStopsReturnType {
	//

	//
	// A. Setup variables

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	//
	// B. Fetch data

	const { data: fetchedOperationalStopsData, error: fetchedOperationalStopsError, isLoading: fetchedOperationalStopsLoading } = useSWR<OperationalStop[], Error>((apiUrl && queryStringParams) && `${apiUrl}?${queryStringParams}`);

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
	}, [props?.filters]);

	const optionsData = useMemo(() => {
		if (!fetchedOperationalStopsData) return [];
		return fetchedOperationalStopsData.map(item => ({
			label: `[${item.stop_id}] ${item.stop_name}`,
			value: String(item.stop_id),
		}));
	}, [fetchedOperationalStopsData]);

	//
	// D. Return data

	return {
		error: fetchedOperationalStopsError,
		isLoading: fetchedOperationalStopsLoading,
		lastUpdatedAt: null,
		options: optionsData,
		raw: fetchedOperationalStopsData ?? [],
	};

	//
};
