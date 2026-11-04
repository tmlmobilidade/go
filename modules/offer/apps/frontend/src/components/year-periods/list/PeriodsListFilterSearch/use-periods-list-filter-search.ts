'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/* * */

/** Periods search URL filter. */
export function usePeriodsListFilterSearch(): UseFilterStateTextReturnType {
	const filter = useFilterStateText('search');
	return filter;
}
