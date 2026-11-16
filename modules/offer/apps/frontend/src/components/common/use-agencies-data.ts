'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { filterPermissionResourceValues, type PermissionsRegistry } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem, toAgencySelectItem, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAgenciesDataProps {
	permissions?: PermissionsRegistry
}

/* * */

interface UseAgenciesDataReturnType {
	data: Agency[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

/** Unscoped lookups supply labels; optional feature permissions filter selectable operators. */
export function useAgenciesData({ permissions }: UseAgenciesDataProps = {}): UseAgenciesDataReturnType {
	//

	//
	// A. Setup variables

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Agency[]>>(API_ROUTES.offer.AGENCIES_LIST, {
		fetcher: async (url: string) => await fetchApiData<Agency[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const agencies = useMemo(() => {
		const items = data?.error || error ? [] : data?.data ?? [];
		if (!permissions) return items;
		const allowedIds = new Set(permissions.actions.flatMap(action => filterPermissionResourceValues({
			action,
			permissions: me?.permissions ?? [],
			resourceKey: 'agency_ids',
			scope: permissions.scope,
			values: items.map(item => item._id),
		})));
		return items.filter(item => allowedIds.has(item._id));
	}, [data, error, me?.permissions, permissions]);
	const ids = useMemo(() => agencies.map(agency => agency._id), [agencies]);
	const options = useMemo(() => agencies.map(toAgencySelectItem), [agencies]);

	//
	// D. Return data

	return useMemo(() => ({
		data: agencies,
		error: data?.error ?? error?.message ?? (permissions ? meError : null) ?? null,
		ids,
		isLoading: isLoading || (!!permissions && meLoading),
		isValidating,
		mutate,
		options,
		timestamp: data?.timestamp,
	}), [agencies, data?.error, data?.timestamp, error, ids, isLoading, isValidating, meError, meLoading, mutate, options, permissions]);
};
