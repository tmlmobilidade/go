'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HolidaysAgencyItem } from '@tmlmobilidade/go-dates-pckg-types';
import { filterPermissionResourceValues, type PermissionsRegistry } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem, toAgencySelectItem, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseHolidaysAgenciesDataProps {
	permissions?: PermissionsRegistry
}

/* * */

interface UseHolidaysAgenciesDataReturnType {
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components. Optional scope/actions filter the available
 * agencies using shared permission helpers; omitted permissions preserve labels.
 * @returns An object containing the agencies data.
 */
export function useHolidaysAgenciesData({ permissions }: UseHolidaysAgenciesDataProps = {}): UseHolidaysAgenciesDataReturnType {
	//

	//
	// A. Setup variables

	const { data: meData, error: meError, isLoading: meLoading, isValidating: meValidating } = useMeData();

	const actions = permissions?.actions;
	const scope = permissions?.scope;

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<HolidaysAgencyItem[]>>(API_ROUTES.dates.HOLIDAYS_LIST_AGENCIES, {
		fetcher: async (url: string) => await fetchApiData<HolidaysAgencyItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const agenciesData = useMemo(() => {
		const agencies = data?.data ?? [];
		// Unfiltered lookups are used for existing read-only labels and legacy consumers.
		if (!scope || !actions) return agencies;

		const agencyIds = agencies.map(agency => agency._id);
		const allowedIds = new Set(actions.flatMap(action => filterPermissionResourceValues({
			action,
			permissions: meData?.permissions ?? [],
			resourceKey: 'agency_ids',
			scope,
			values: agencyIds,
		})));

		return agencies.filter(agency => allowedIds.has(agency._id));
	}, [data?.data, actions, scope, meData?.permissions]);

	const idsData = useMemo(() => {
		return agenciesData.map(agency => agency._id);
	}, [agenciesData]);

	const optionsData = useMemo(() => {
		return agenciesData.map(toAgencySelectItem);
	}, [agenciesData]);

	//
	// D. Return value

	return useMemo(() => ({
		error: data?.error ?? error?.message ?? (permissions ? meError : null) ?? null,
		ids: idsData,
		isLoading: isLoading || (!!permissions && meLoading),
		isValidating: isValidating || (!!permissions && meValidating),
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.error, error, idsData, isLoading, isValidating, optionsData, data?.timestamp, permissions, meError, meLoading, meValidating]);
};
