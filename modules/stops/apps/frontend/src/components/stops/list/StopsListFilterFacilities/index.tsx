'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Translations } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterFacilities() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={stopsListContext.filters.facilities.isActive}
			label="Serviços"
			onChange={stopsListContext.filters.facilities.set}
			options={stopsListContext.filters.facilities.options.map(option => ({
				...option,
				label: Translations.FACILITIES[option.value as keyof typeof Translations.FACILITIES],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
