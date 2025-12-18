'use client';

/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { Translations } from '@/lib/translations';
import { StopFacilitySchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(StopFacilitySchema.options) as string[];
		const enabledValues = stopsListContext.filters.facilities;
		if (defaultValues.length !== enabledValues.length) return true;
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopsListContext.filters.facilities]);

	const parsedOptions = useMemo(() => {
		if (!StopFacilitySchema.options?.length) return [];
		return StopFacilitySchema.options.map(item => ({
			checked: stopsListContext.filters.facilities.includes(item),
			label: Translations.FACILITIES[item],
			value: item,
		}));
	}, [stopsListContext.filters.facilities]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Serviços"
			onChange={stopsListContext.actions.setFilterFacilities}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
