'use client';

import { useFilterStateToggle, type UseFilterStateToggleReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the favorites filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterFavorites(): UseFilterStateToggleReturnType {
	//

	return useFilterStateToggle('favorites');
}
