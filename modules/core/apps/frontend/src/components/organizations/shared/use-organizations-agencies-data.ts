'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AgenciesListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

/**
 * Fetches existing agencies for organization filters and selects.
 */
export function useOrganizationsAgenciesData() {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<AgenciesListItem[]>>(API_ROUTES.core.AGENCIES_LIST, {
		fetcher: async (url: string) => await fetchApiData<AgenciesListItem[]>({ url }),
		refreshInterval: 10_000,
	});

	//
	// B. Transform data

	const agenciesData = data?.data;

	const options = useMemo(() => agenciesData?.map((agency): SelectDataItem => ({
		label: `[${agency._id}] ${agency.code} - ${agency.name}`,
		value: agency._id,
	})) ?? [], [agenciesData]);

	const ids = useMemo(() => agenciesData?.map(agency => agency._id) ?? [], [agenciesData]);

	//
	// C. Return data

	return useMemo(() => ({
		data: agenciesData,
		error: error?.error,
		ids,
		isLoading,
		isValidating,
		mutate,
		options,
		timestamp: data?.timestamp,
	}), [agenciesData, data?.timestamp, error, ids, isLoading, isValidating, mutate, options]);
}
