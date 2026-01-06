'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { StopFacilitySchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();
	const { t } = useTranslation('stops');

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
			label: t(`${Translations.FACILITIES}.${item}`),
			value: item,
		}));
	}, [stopsListContext.filters.facilities, t]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('stops.list.FilterBar.FilterFacilities.label')}
			onChange={stopsListContext.actions.setFilterFacilities}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
