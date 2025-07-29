/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { useStopListContext } from '@/contexts/StopList.context';
import { Combobox } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterDistrict() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();
	const locations = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(locations.data.district_ids) as string[];
		const enabledValues = stopListContext.filters.filterDistrict;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [locations.data.district_ids]);

	const parsedOptions = useMemo(() => {
		if (!locations.data.districts?.length) return [];

		return locations.data.districts.map(item => ({
			label: item.name,
			value: item.id,
		}));
	}, [locations.data.districts, stopListContext.filters.filterDistrict]);

	//
	// C. Render components

	return (
		<Combobox
			data={parsedOptions}
			label="Distrito"
			placeholder="..."
			width={300}
			fullWidth
			{...stopListContext.actions.setFilterDistrict}
		/>
	);

	//
}
