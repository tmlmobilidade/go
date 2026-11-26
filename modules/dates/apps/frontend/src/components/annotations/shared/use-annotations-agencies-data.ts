'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AnnotationsAgencyItem } from '@tmlmobilidade/go-dates-pckg-types';
import { filterPermissionResourceValues, type PermissionsRegistry } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem, toAgencySelectItem, useMePermissions } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAnnotationsAgenciesDataProps {
	permissions?: PermissionsRegistry
}

/* * */

interface UseAnnotationsAgenciesDataReturnType {
	data: AnnotationsAgencyItem[]
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
export function useAnnotationsAgenciesData({ permissions }: UseAnnotationsAgenciesDataProps = {}): UseAnnotationsAgenciesDataReturnType {
	//

	//
	// A. Setup variables

	const { data: mePermissions, error: mePermissionsError, isLoading: mePermissionsLoading, isValidating: mePermissionsValidating } = useMePermissions();

	const actions = permissions?.actions;
	const scope = permissions?.scope;

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<AnnotationsAgencyItem[]>>(API_ROUTES.dates.ANNOTATIONS_LIST_AGENCIES, {
		fetcher: async (url: string) => await fetchApiData<AnnotationsAgencyItem[]>({ url }),
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
			permissions: mePermissions ?? [],
			resourceKey: 'agency_ids',
			scope,
			values: agencyIds,
		})));

		return agencies.filter(agency => allowedIds.has(agency._id));
	}, [data?.data, actions, scope, mePermissions]);

	const idsData = useMemo(() => {
		return agenciesData.map(agency => agency._id);
	}, [agenciesData]);

	const optionsData = useMemo(() => {
		return agenciesData.map(toAgencySelectItem);
	}, [agenciesData]);

	//
	// D. Return value

	return useMemo(() => ({
		data: agenciesData,
		error: data?.error ?? error?.message ?? (permissions ? mePermissionsError : null) ?? null,
		ids: idsData,
		isLoading: isLoading || (!!permissions && mePermissionsLoading),
		isValidating: isValidating || (!!permissions && mePermissionsValidating),
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [agenciesData, data?.error, error, idsData, isLoading, isValidating, optionsData, data?.timestamp, permissions, mePermissionsError, mePermissionsLoading, mePermissionsValidating]);
};
