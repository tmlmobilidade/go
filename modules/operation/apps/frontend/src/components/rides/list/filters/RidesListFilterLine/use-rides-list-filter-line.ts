'use client';

import { useFilterStateTag, type UseFilterStateTagReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the line filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterLine(): UseFilterStateTagReturnType {
	return useFilterStateTag('line');
}
