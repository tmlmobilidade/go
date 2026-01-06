'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { StopEquipmentSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterEquipment() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();
	const { t } = useTranslation('stops');

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(StopEquipmentSchema.options) as string[];
		const enabledValues = stopsListContext.filters.equipment;
		if (defaultValues.length !== enabledValues.length) return true;
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopsListContext.filters.equipment]);

	const parsedOptions = useMemo(() => {
		if (!StopEquipmentSchema.options?.length) return [];
		return StopEquipmentSchema.options.map(item => ({
			checked: stopsListContext.filters.equipment.includes(item),
			label: t(`${Translations.EQUIPMENT}.${item}`),
			value: item,
		}));
	}, [stopsListContext.filters.equipment, t]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('stops.list.FilterBar.FilterEquipment.label')}
			onChange={stopsListContext.actions.setFilterEquipment}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
