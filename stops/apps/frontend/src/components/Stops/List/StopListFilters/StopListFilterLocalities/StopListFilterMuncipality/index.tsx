/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { useStopListContext } from '@/contexts/StopList.context';
import { Combobox } from '@tmlmobilidade/ui';
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
		<Combobox
			data={parsedOptions}
			label="Municipio"
			// onChange={locations.actions.}
			placeholder="..."
			fullWidth
		/>
	);

	//
}
