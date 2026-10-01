'use client';

/* * */

import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface NaveganteFaq {
	_order: string
	answer: string
	id: string
	question: string
}

interface UseHelpDetailDataReturnType {
	data: NaveganteFaq[] | undefined
	error: Error | undefined
	isLoading: boolean
}

/* * */

const FAQS_URL = 'https://carrismetropolitana.pt/admin/public-api/faqs-navegante';

/**
 * Fetches the Navegante FAQs shown in the help bottom sheet.
 */
export function useHelpDetailData(): UseHelpDetailDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<NaveganteFaq[], Error>({ credentials: 'omit', url: FAQS_URL, useProperApiResponse: false }, { refreshInterval: 300_000 });

	//
	// B. Return data

	return useMemo(() => ({
		data,
		error,
		isLoading,
	}), [data, error, isLoading]);
}
