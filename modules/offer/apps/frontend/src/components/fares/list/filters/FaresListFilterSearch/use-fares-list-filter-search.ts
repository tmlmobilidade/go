'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/* * */

/** Fares search URL filter. */
export function useFaresListFilterSearch(): UseFilterStateTextReturnType {
	const filter = useFilterStateText('search');
	return filter;
}
