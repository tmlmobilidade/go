'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useAnnotationsDatesData } from '../../../shared/use-annotations-dates-data';

/**
 * Hook to manage the dates filter for the annotations list.
 * The filter is read from the URL only; it has no visible component yet.
 * @returns The filter state management object.
 */
export function useAnnotationsListFilterDates(): UseFilterStateListReturnType {
	//

	const { options } = useAnnotationsDatesData();

	return useFilterStateList('dates', [], options);
}
