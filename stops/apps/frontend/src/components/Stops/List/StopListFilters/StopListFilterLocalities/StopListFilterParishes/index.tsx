/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterParish() {
	//

	//
	// A. Setup variables

	const locations = useLocationsContext();

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locations.data.parishes?.length) return [];

		return locations.data.parishes.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locations.data.parishes]);

	//
	// C. Render components

	return (
		<MultiSelect
			data={parsedOptions}
			label="Freguesia"
			onChange={locations.actions.setParish}
			selected={locations.data.selectedLocation?.parishes?.map(item => item._id) ?? []}
			clearable
		/>
	);

	//
}
