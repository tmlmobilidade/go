'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/**
 * Hook to manage the municipality filter for the stops list filter bar.
 * @returns The filter state management object.
 */
export function useStopsListFilterMunicipality(): UseFilterStateListReturnType {
	const locationsContext = useLocationsContext();

	const municipalityOptions = useMemo(
		() => Array.from(locationsContext.data.municipalities.values())
			.map(item => ({ label: item.name, value: item._id }))
			.sort((a, b) => a.label?.localeCompare(b.label, 'pt')),
		[locationsContext.data.municipalities],
	);

	const filterMunicipality = useFilterStateList(
		'municipalities',
		Array.from(locationsContext.data.municipalities.keys()),
		municipalityOptions,
	);

	const { data: allStopsData } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);

	const filteredMunicipalityOptions = useMemo(() => {
		if (!allStopsData?.length || !filterMunicipality.options?.length) {
			return filterMunicipality.options;
		}
		const municipalityIds = new Set(allStopsData.map(stop => stop.municipality_id));

		return filterMunicipality.options.filter(item => municipalityIds.has(item.value));
	}, [allStopsData, filterMunicipality.options]);

	return { ...filterMunicipality, options: filteredMunicipalityOptions };
}
