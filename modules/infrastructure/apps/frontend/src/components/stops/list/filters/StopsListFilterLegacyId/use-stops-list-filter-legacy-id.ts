'use client';

import { useFilterStateTag, type UseFilterStateTagReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the legacy ID filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterLegacyId(): UseFilterStateTagReturnType {
	return useFilterStateTag('legacy_id');
}
