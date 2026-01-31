/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { OperationalStatusSchema } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RidesListFilterOperationalStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = OperationalStatusSchema.options;
		const enabledValues = ridesListContext.filters.operational_status;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [ridesListContext.filters.operational_status]);

	const parsedOptions = useMemo(() => {
		// Parse options to the expected format.
		return OperationalStatusSchema.options.map(value => ({
			checked: ridesListContext.filters.operational_status.includes(value),
			label: value,
			value: value,
		}));
	}, [ridesListContext.filters.operational_status]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Estado"
			onChange={ridesListContext.actions.setFilterOperationalStatus}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
