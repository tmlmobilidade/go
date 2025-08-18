/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const locations = useLocationsContext();

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locations.data.municipalities?.length) return [];

		return locations.data.municipalities.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locations.data.municipalities]);

	//
	// C. Render components

	return (

		<MultiSelect
			data={parsedOptions}
			label="Municipio"
			onChange={locations.actions.setMunicipalities}
			selected={locations.data.selectedLocation?.municipalities?.map(item => item._id) ?? []}
			clearable
		/>
	);

	//
}
