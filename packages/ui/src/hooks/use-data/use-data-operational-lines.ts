'use client';

import { useDebouncedState } from '@mantine/hooks';
import { type GetOperationalLinesBatchQuery, type OperationalLine, type UnixTimestamp } from '@tmlmobilidade/types';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../../components/inputs/Select';

/* * */

interface UseDataOperationalLinesProps {
	filters: GetOperationalLinesBatchQuery
}

/* * */

interface UseDataOperationalLinesReturnType {
	error: Error | undefined
	isLoading: boolean
	lastUpdatedAt: null | UnixTimestamp
	options: SelectDataItem[]
	raw: OperationalLine[]
}

/* * */

export function useDataOperationalLines(apiUrl: string, props?: UseDataOperationalLinesProps): UseDataOperationalLinesReturnType {
	//

	//
	// A. Setup variables

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	//
	// B. Fetch data

	const { data: fetchedOperationalLinesData, error: fetchedOperationalLinesError, isLoading: fetchedOperationalLinesLoading } = useSWR<OperationalLine[], Error>((apiUrl && queryStringParams) && `${apiUrl}?${queryStringParams}`);

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
	}, [props?.filters.agency_ids, props?.filters.date_start, props?.filters.date_end]);

	const optionsData = useMemo(() => {
		if (!fetchedOperationalLinesData) return [];
		return fetchedOperationalLinesData.map(item => ({
			label: `[${item.last_plan_id}] (${item.line_short_name}) ${item.line_long_name}`,
			value: String(item.line_id),
		}));
	}, [fetchedOperationalLinesData]);

	//
	// D. Return data

	return {
		error: fetchedOperationalLinesError,
		isLoading: fetchedOperationalLinesLoading,
		lastUpdatedAt: null,
		options: optionsData,
		raw: fetchedOperationalLinesData ?? [],
	};

	//
};
