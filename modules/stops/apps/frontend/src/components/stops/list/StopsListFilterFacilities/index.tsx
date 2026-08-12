'use client';

import { Translations } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';

import { useStopsListFilterFacilities } from './use-stops-list-filter-facilities';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const filterFacilities = useStopsListFilterFacilities();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterFacilities.isActive}
			label="Serviços"
			onChange={filterFacilities.set}
			options={filterFacilities.options.map(option => ({
				...option,
				label: Translations.FACILITIES[option.value as keyof typeof Translations.FACILITIES],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
