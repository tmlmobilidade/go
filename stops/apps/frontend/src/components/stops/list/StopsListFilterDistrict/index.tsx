'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterDistrict() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locationsContext.data.districts?.length) return [];
		return locationsContext.data.districts.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locationsContext.data.districts]);

	//
	// C. Render components

	return (
		<MultiSelect
			data={parsedOptions}
			label="Distrito"
			onChange={locationsContext.actions.setDistricts}
			selected={locationsContext.data.selectedLocation?.districts?.map(item => item._id)}
			clearable
		/>
	);

	//
}
