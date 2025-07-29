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

	const parsedOptions = useMemo(() => {
		if (!locations.data.districts?.length) return [];

		return locations.data.districts.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locations.data.districts]);

	//
	// C. Render components

	return (
		<Combobox
			data={parsedOptions}
			label="Distrito"
			onChange={locations.actions.setDistrict}
			placeholder="..."
			fullWidth
		/>
	);

	//
}
