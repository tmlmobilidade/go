/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { gradeValues } from '@/types/normalized';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RidesListFilterSimpleThreeEvents() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = gradeValues;
		const enabledValues = ridesListContext.filters.simple_three_vehicle_events;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [ridesListContext.filters.simple_three_vehicle_events]);

	const parsedOptions = useMemo(() => {
		// Parse options to the expected format.
		return gradeValues.map(value => ({
			checked: ridesListContext.filters.simple_three_vehicle_events.includes(value),
			label: value,
			value: value,
		}));
	}, [ridesListContext.filters.simple_three_vehicle_events]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="3 Momentos"
			onChange={ridesListContext.actions.setFilterSimpleThreeVehicleEvents}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
