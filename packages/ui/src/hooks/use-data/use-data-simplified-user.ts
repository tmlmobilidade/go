'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedUser } from '@tmlmobilidade/types';
import useSWR from 'swr';

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
	error: Error | undefined

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

	const { data: simplifiedUserData, error: simplifiedUserError, isLoading: simplifiedUserLoading } = useSWR<SimplifiedUser, Error>(props._id && props._id !== 'system' && API_ROUTES.auth.USERS_DETAIL_SIMPLIFIED(props._id));

	//
	// B. Return value

	return {
		data: simplifiedUserData,
		error: simplifiedUserError,
		isLoading: simplifiedUserLoading,
	};

	//
};
