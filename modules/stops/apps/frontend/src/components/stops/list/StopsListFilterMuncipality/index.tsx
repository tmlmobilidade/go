'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopsListContext = useStopsListContext();

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
			onChange={stopsListContext.actions.setFilterMunicipalities}
			value={stopsListContext.filters.municipalities}
			clearable
		/>
	);

	//
}
