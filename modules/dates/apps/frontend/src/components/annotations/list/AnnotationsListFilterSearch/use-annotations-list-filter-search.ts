'use client';

import { useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';

/* * */

/** Annotations search URL filter. */
export function useAnnotationsListFilterSearch(): UseFilterStateTextReturnType {
	const filter = useFilterStateText('search');
	return filter;
}
