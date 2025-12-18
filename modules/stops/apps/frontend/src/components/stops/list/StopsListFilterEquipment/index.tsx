'use client';

/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { Translations } from '@/lib/translations';
import { StopEquipmentSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterEquipment() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

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
			label: Translations.EQUIPMENT[item],
			value: item,
		}));
	}, [stopsListContext.filters.equipment]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Equipamentos"
			onChange={stopsListContext.actions.setFilterEquipment}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
