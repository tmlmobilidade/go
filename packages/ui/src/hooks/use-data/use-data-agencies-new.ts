'use client';

import { type ActionsOf, type Agency, type Permission } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../../components/inputs/Select';

/* * */

interface UseDataAgenciesProps<S extends Permission['scope']> {
	actions: ActionsOf<S>[]
	scope: S
}

/* * */

interface UseDataAgenciesReturnType {

	/**
	 * The server-filtered agencies data.
	 */
	agencies: Agency[]

	/**
	 * The IDs of the agencies.
	 */
	agencyIds: string[]

	/**
	 * The error encountered while fetching data, if any.
	 */
	error: Error | undefined

	/**
	 * Indicates if the data is still loading.
	 */
	isLoading: boolean

	/**
	 * The agencies data formatted for select inputs.
	 */
	options: SelectDataItem[]

}

/**
 * Hook to fetch agencies from a scope-specific API endpoint.
 * Permission filtering is expected to happen server-side.
 */
export function useDataAgenciesNew<S extends Permission['scope']>(apiUrl: string, props: UseDataAgenciesProps<S>): UseDataAgenciesReturnType {
	//

	//
	// A. Setup variables

	const actionsQuery = props.actions.join(',');

	//
	// B. Fetch data

	const agenciesApiUrl = useMemo(() => {
		if (!apiUrl || !actionsQuery) return null;

		const searchParams = new URLSearchParams({
			actions: actionsQuery,
			scope: props.scope,
		});

		return `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${searchParams.toString()}`;
	}, [actionsQuery, apiUrl, props.scope]);

	const { data: agenciesData, error: agenciesError, isLoading: agenciesLoading } = useSWR<Agency[], Error>(agenciesApiUrl);

	//
	// C. Transform data

	const sortedData = useMemo(() => {
		// Skip if no data is available
		if (!agenciesData?.length) return [];
		// Sort a copy to avoid mutating SWR cache data
		return [...agenciesData].sort((a, b) => Number(a._id) - Number(b._id));
	}, [agenciesData]);

	const agencyIds = useMemo(() => {
		// Skip if no data is available
		if (!sortedData?.length) return [];
		// Keep only the IDs of the agency data
		return sortedData.map(item => item._id);
	}, [sortedData]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!sortedData?.length) return [];
		// Map data to SelectDataItem format
		return sortedData.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `${item._id} - ${item.name}`,
			value: item._id,
		}));
	}, [sortedData]);

	//
	// D. Return value

	return {
		agencies: sortedData,
		agencyIds: agencyIds,
		error: agenciesError,
		isLoading: agenciesLoading,
		options: optionsData,
	};

	//
};
