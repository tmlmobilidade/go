'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useEventsDatesData } from '../../../shared/use-events-dates-data';

/**
 * Hook to manage the dates filter for the events list.
 * The filter is read from the URL only; it has no visible component yet.
 * @returns The filter state management object.
 */
export function useEventsListFilterDates(): UseFilterStateListReturnType {
	//

	const { options } = useEventsDatesData();

	return useFilterStateList('dates', [], options);
}
