'use client';

import { Translations } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';

import { useStopsListFilterEquipment } from './use-stops-list-filter-equipment';

/* * */

export function StopsListFilterEquipment() {
	//

	//
	// A. Setup variables

	const filterEquipment = useStopsListFilterEquipment();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterEquipment.isActive}
			label="Equipamentos"
			onChange={filterEquipment.set}
			options={filterEquipment.options.map(option => ({
				...option,
				label: Translations.EQUIPMENT[option.value as keyof typeof Translations.EQUIPMENT],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
