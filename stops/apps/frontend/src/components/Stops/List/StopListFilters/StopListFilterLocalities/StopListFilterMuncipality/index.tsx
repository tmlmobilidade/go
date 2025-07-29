/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { useStopListContext } from '@/contexts/StopList.context';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();
	const locations = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(locations.data.municipality_ids) as string[];
		const enabledValues = stopListContext.filters.filterMunicipality;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [locations.data.municipality_ids, stopListContext.filters.filterMunicipality]);

	const parsedOptions = useMemo(() => {
		if (!locations.data.municipalities?.length) return [];
		if (!locations.data.districts?.length) return [];

		return locations.data.municipalities.map(item => ({
			checked: stopListContext.filters.filterMunicipality.includes(item),
			label: item.name,
			value: item,
		}));
	}, [locations.data.municipalities, stopListContext.filters.filterMunicipality]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="Municipios"
			onChange={stopListContext.actions.setFilterMunicipality}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
