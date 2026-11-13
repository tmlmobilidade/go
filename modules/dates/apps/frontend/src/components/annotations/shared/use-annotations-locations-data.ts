'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type LocationItem, type LocationTreeNode, LocationTreeNodeSchema } from '@tmlmobilidade/go-types-locations';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAnnotationsLocationsDataReturnType {
	error: null | string
	isLoading: boolean
	isValidating: boolean
	locationsById: Map<string, LocationItem>
	mutate: () => void
	timestamp: null | UnixMilliseconds
	tree: LocationTreeNode[]
}

/* * */

/** Fetches the authoritative hierarchy and maps selectable IDs to stored location items. */
export function useAnnotationsLocationsData(): UseAnnotationsLocationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<LocationTreeNode[]>>(API_ROUTES.dates.ANNOTATIONS_LIST_LOCATIONS, {
		fetcher: async (url: string) => {
			const response = await fetchApiData<LocationTreeNode[]>({ url });
			if (response.status_code !== '200' && response.status_code !== '201' && response.status_code !== '204') return response;
			return { ...response, data: LocationTreeNodeSchema.array().parse(response.data) };
		},
		revalidateOnFocus: false,
	});

	//
	// B. Transform data

	const locationsById = useMemo(() => {
		const byId = new Map<string, LocationItem>();
		const visit = (nodes: LocationTreeNode[]) => {
			for (const node of nodes) {
				byId.set(node.id, { admin_level: node.admin_level, code: node.code, name: node.name, osm_id: Number(node.id) });
				visit(node.children);
			}
		};
		visit(data?.data ?? []);
		return byId;
	}, [data?.data]);

	//
	// C. Return data

	return useMemo(() => ({
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		locationsById,
		mutate,
		timestamp: data?.timestamp ?? null,
		tree: data?.data ?? [],
	}), [data?.data, data?.error, data?.timestamp, error, isLoading, isValidating, locationsById, mutate]);
}
