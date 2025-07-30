/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Translations } from '@/lib/translations';
import { equipmentSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterEquipment() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(equipmentSchema.options) as string[];
		const enabledValues = stopListContext.filters.Equipment;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopListContext.filters.Equipment]);

	const parsedOptions = useMemo(() => {
		if (!equipmentSchema.options?.length) return [];

		return equipmentSchema.options.map(item => ({
			checked: stopListContext.filters.Equipment.includes(item),
			label: Translations.EQUIPMENT[item],
			value: item,
		}));
	}, [stopListContext.filters.Equipment]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="Equipamentos"
			onChange={stopListContext.actions.setFilterEquipment}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
