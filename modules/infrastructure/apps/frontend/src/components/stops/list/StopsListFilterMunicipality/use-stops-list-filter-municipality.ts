'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { type Stop } from '@tmlmobilidade/types';
import { fetchApiData, useFilterStateList, type UseFilterStateListReturnType, useLocationsContext } from '@tmlmobilidade/ui';
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

	const { data: stopsResponse } = useSWR<ApiResponse<Stop[]>>(API_ROUTES.infrastructure.STOPS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Stop[]>({ url }),
	});
	const allStopsData = stopsResponse?.data;

	const filteredMunicipalityOptions = useMemo(() => {
		if (!allStopsData?.length || !filterMunicipality.options?.length) {
			return filterMunicipality.options;
		}
		const municipalityIds = new Set(allStopsData.map(stop => stop.municipality_id));

		return filterMunicipality.options.filter(item => municipalityIds.has(item.value));
	}, [allStopsData, filterMunicipality.options]);

	return { ...filterMunicipality, options: filteredMunicipalityOptions };
}
