'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/* * */

/** Zones search URL filter. */
export function useZonesListFilterSearch(): UseFilterStateTextReturnType {
	const filter = useFilterStateText('search');
	return filter;
}
