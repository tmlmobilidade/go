/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { delayStatusValues } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { FilterTypeList } from '@go/ui';
import { useMemo } from 'react';

/* * */

export function RidesListFilterDelayStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = delayStatusValues;
		const enabledValues = ridesListContext.filters.delay_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [ridesListContext.filters.delay_status]);

	const parsedOptions = useMemo(() => {
		// Parse options to the expected format.
		return delayStatusValues.map(value => ({
			checked: ridesListContext.filters.delay_status.includes(value),
			label: value,
			value: value,
		}));
	}, [ridesListContext.filters.delay_status]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Atraso"
			onChange={ridesListContext.actions.setFilterDelayStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
