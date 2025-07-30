/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const locations = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(locations.data.municipality) as string[];
		const enabledValues = locations.data.municipality;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [locations.data.municipality]);

	const parsedOptions = useMemo(() => {
		if (!locations.data.municipality?.length) return [];

		return locations.data.municipality.map(item => ({
			checked: locations.filters.filterMunicipality.includes(item),
			label: locations.data.municipality.filter.name,
			value: item,
		}));
	}, [locations.data.municipality, locations.filters.filterMunicipality]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="Municipios"
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
