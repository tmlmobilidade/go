'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type GetRidesQuery, GetRidesQuerySchema, type RideView } from '@tmlmobilidade/go-types-operation';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { type SelectDataItem, useStateRef } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useEffect, useMemo, useState } from 'react';

/* * */

interface UseDataRidesProps {
	query: GetRidesQuery
}

/* * */

interface UseDataRidesReturnType {
	error: null | string
	isLoading: boolean
	lastUpdatedAt: null | UnixTimestamp
	options: SelectDataItem[]
	raw: RideView[]
}

/* * */

export function useDataRides(apiUrl: string, props?: UseDataRidesProps): UseDataRidesReturnType {
	//

	//
	// A. Setup variables

	const ridesData = useStateRef<RideView[]>([]);

	const [isError, setIsError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<null | UnixTimestamp>(null);

	//
	// B. Fetch data

	const serializedQuery = JSON.stringify(props?.query);

	useEffect(() => {
		(async () => {
			try {
				// Set the loading state
				setIsLoading(true);
				// Skip if no API URL is provided
				if (!apiUrl) return;
				if (!serializedQuery) return;
				// Validate the query against the schema
				const validatedQuery = GetRidesQuerySchema.parse(JSON.parse(serializedQuery));
				// Fetch the data and parse the response
				const responseData = await fetchData<RideView[]>(apiUrl, 'POST', validatedQuery);
				if (!responseData.data) return;
				// Set the data in the state
				ridesData.set(responseData.data);
				// Set the last updated at
				setLastUpdatedAt(Dates.now('local').unix_timestamp);
			} catch (error) {
				setIsError(error instanceof Error ? error.message : 'Unknown error');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [apiUrl, serializedQuery]);

	//
	// C. Transform data

	const optionsData = useMemo(() => {
		if (!ridesData.state) return [];
		return ridesData.state.map(ride => ({
			label: ride.headsign,
			value: ride.trip_id,
		}));
	}, [ridesData.state]);

	//
	// D. Return data

	return {
		error: isError,
		isLoading: isLoading,
		lastUpdatedAt: lastUpdatedAt,
		options: optionsData,
		raw: ridesData.state ?? [],
	};
};
