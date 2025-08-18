'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locationsContext.data.municipalities?.length) return [];
		return locationsContext.data.municipalities.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locationsContext.data.municipalities]);

	//
	// C. Render components

	return (

		<MultiSelect
			data={parsedOptions}
			label="Municipio"
			onChange={locationsContext.actions.setMunicipalities}
			selected={locationsContext.data.selectedLocation?.municipalities?.map(item => item._id) ?? []}
			clearable
		/>
	);

	//
}
