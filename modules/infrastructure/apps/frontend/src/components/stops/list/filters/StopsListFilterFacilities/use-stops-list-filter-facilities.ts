'use client';

import { StopFacility, StopFacilityValues } from '@tmlmobilidade/go-types-infrastructure';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the facilities filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterFacilities(): UseFilterStateListReturnType<StopFacility> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		StopFacilityValues.map(item => ({
			label: t(`infrastructure:stop_facility.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'facilities',
		[...StopFacilityValues],
		selectOptions,
	);
}
