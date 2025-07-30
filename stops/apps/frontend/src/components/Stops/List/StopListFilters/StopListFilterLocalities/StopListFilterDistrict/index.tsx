/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterDistrict() {
	//

	//
	// A. Setup variables

	const locations = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(locations.data.district) as string[];
		const enabledValues = locations.data.district;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [locations.data.district]);

	const parsedOptions = useMemo(() => {
		if (!locations.data.district?.length) return [];

		return locations.data.district.map(item => ({
			checked: locations.filters.filterDistrict.includes(item),
			label: locations.data.district.filter.name,
			value: item,
		}));
	}, [locations.data.district, locations.filters.filterDistrict]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="distritos"
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
