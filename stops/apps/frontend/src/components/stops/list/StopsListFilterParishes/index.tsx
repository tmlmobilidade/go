/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterParish() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locationsContext.data.parishes?.length) return [];
		return locationsContext.data.parishes.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locationsContext.data.parishes]);

	//
	// C. Render components

	return (
		<MultiSelect
			data={parsedOptions}
			label="Freguesia"
			onChange={locationsContext.actions.setParishes}
			selected={locationsContext.data.selectedLocation?.parishes?.map(item => item._id) ?? []}
			clearable
		/>
	);

	//
}
