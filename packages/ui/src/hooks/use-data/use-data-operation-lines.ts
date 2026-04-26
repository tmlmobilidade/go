'use client';

/* * */

import { type GetOperationLinesBatchQuery, type OperationLine, type UnixTimestamp } from '@tmlmobilidade/types';
import { type SelectDataItem, useDebouncedState } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseDataOperationLinesProps {
	filters: GetOperationLinesBatchQuery
}

/* * */

interface UseDataOperationLinesReturnType {
	error: Error | undefined
	isLoading: boolean
	lastUpdatedAt: null | UnixTimestamp
	options: SelectDataItem[]
	raw: OperationLine[]
}

/* * */

export function useDataOperationLines(apiUrl: string, props?: UseDataOperationLinesProps): UseDataOperationLinesReturnType {
	//

	//
	// A. Setup variables

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	//
	// B. Fetch data

	const { data: fetchedOperationLinesData, error: fetchedOperationLinesError, isLoading: fetchedOperationLinesLoading } = useSWR<OperationLine[], Error>((apiUrl && queryStringParams) && `${apiUrl}?${queryStringParams}`, { refreshInterval: 60_000 });

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
		if (!fetchedOperationLinesData) return [];
		return fetchedOperationLinesData.map(item => ({
			label: `(${item.line_short_name}) ${item.line_long_name}`,
			value: String(item.line_id),
		}));
	}, [fetchedOperationLinesData]);

	//
	// D. Return data

	return {
		error: fetchedOperationLinesError,
		isLoading: fetchedOperationLinesLoading,
		lastUpdatedAt: null,
		options: optionsData,
		raw: fetchedOperationLinesData ?? [],
	};

	//
};
