'use client';

import { useFilterStateList, type UseFilterStateListReturnType, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the municipality filter for the schools list filter bar.
 * @returns The filter state management object.
 */
export function useSchoolsListFilterMunicipality(): UseFilterStateListReturnType {
	const locationsContext = useLocationsContext();

	const options = useMemo(() => Array.from(locationsContext.data.municipalities.values())
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [locationsContext.data.municipalities]);

	return useFilterStateList(
		'municipality_ids',
		options.map(option => option.value),
		options,
	);
}
