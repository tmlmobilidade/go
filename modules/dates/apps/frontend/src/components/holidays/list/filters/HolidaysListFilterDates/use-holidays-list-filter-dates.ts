'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useHolidaysDatesData } from '../../../shared/use-holidays-dates-data';

/**
 * Hook to manage the dates filter for the holidays list.
 * The filter is read from the URL only; it has no visible component yet.
 * @returns The filter state management object.
 */
export function useHolidaysListFilterDates(): UseFilterStateListReturnType {
	//

	const { options } = useHolidaysDatesData();

	return useFilterStateList('dates', [], options);
}
