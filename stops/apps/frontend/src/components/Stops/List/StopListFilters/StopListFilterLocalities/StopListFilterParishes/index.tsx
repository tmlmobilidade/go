/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { connectionsSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterParish() {
	//

	//
	// A. Setup variables

	const locations = useLocationsContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(locations.data.parish) as string[];
		const enabledValues = locations.data.parish;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [locations.data.parish]);

	const parsedOptions = useMemo(() => {
		if (!locations.data.parish?.length) return [];

		return connectionsSchema.options.map(item => ({
			checked: locations.filters.filterParish.includes(item),
			label: locations.data.parish.filter.name,
			value: item,
		}));
	}, [locations.filters.filterParish]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="freguesias"
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
