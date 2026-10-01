'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type TreeSelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseUsersLocationsDataReturnType {
	error: null | string
	options: TreeSelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

function toTreeSelectData(nodes: LocationTreeNode[]): TreeSelectDataItem[] {
	return nodes.map(node => ({
		children: node.children.length ? toTreeSelectData(node.children) : undefined,
		label: node.admin_level !== 'neigberhood' ? `[${node.admin_level}] ${node.name}` : node.name,
		value: node.id,
	}));
}

/**
 * Hook to fetch the locations tree. Useful for supplying data
 * to tree select components.
 * @returns An object containing the locations tree data.
 */
export function useUsersLocationsData(): UseUsersLocationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error } = useSWR<ApiResponse<LocationTreeNode[]>>(API_ROUTES.core.USERS_LIST_LOCATIONS, {
		fetcher: async (url: string) => await fetchApiData<LocationTreeNode[]>({ url }),
	});

	//
	// B. Transform data

	const optionsData = useMemo(() => toTreeSelectData(data?.data ?? []), [data?.data]);

	//
	// C. Return value

	return useMemo(() => ({
		error: error?.error,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [error?.error, optionsData, data?.timestamp]);
};
