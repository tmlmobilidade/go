'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterEquipment() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.equipment.isActive}
			label="Equipamentos"
			onChange={stopsListContext.filters.equipment.set}
			options={stopsListContext.filters.equipment.options.map(option => ({
				...option,
				label: Translations.EQUIPMENT[option.value as keyof typeof Translations.EQUIPMENT],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
