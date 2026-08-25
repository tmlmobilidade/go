'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedUser } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import useSWR from 'swr';

import { fetchApiData } from '../../fetch/fetch-api-data';

/* * */

interface UseDataSimplifiedUserProps {
	_id: string
}

/* * */

interface UseDataSimplifiedUserReturnType {

	/**
	 * The raw agencies data.
	 */
	data: SimplifiedUser | undefined

	/**
	 * The error encountered while fetching data, if any.
	 */
	error: null | string

	/**
	 * Indicates whether the data is currently being loaded.
	 */
	isLoading: boolean

}

/**
 * Hook to determine if an item should be in read-only mode
 * based on user permissions and item state.
 * @param props The properties to determine read-only status.
 * @returns An object containing the isCanSave flag.
 */
export function useDataSimplifiedUser(props?: UseDataSimplifiedUserProps): UseDataSimplifiedUserReturnType {
	//

	//
	// A. Fetch data

	const userId = props?._id;

	const { data, error, isLoading } = useSWR<ApiResponse<SimplifiedUser>>(userId && userId !== 'system' ? API_ROUTES.core.USERS_DETAIL_SIMPLIFIED(userId) : null, {
		fetcher: async (url: string) => await fetchApiData<SimplifiedUser>({ url }),
	});

	//
	// B. Return value

	return {
		data: data?.data ?? undefined,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
	};

	//
};
