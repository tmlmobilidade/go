'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/* * */

/** Holidays search URL filter. */
export function useHolidaysListFilterSearch(): UseFilterStateTextReturnType {
	const filter = useFilterStateText('search');
	return filter;
}
