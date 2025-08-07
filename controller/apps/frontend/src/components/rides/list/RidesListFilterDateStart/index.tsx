/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { DateTimePicker } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

/* * */

export function RidesListFilterDateStart() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValue = null;
		const enabledValue = ridesListContext.filters.date_start;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValue !== enabledValue) return true;
	}, [ridesListContext.filters.date_start]);

	const valueAsString = useMemo(() => {
		if (!ridesListContext.filters.date_start) return null;
		return Dates
			.fromUnixTimestamp(ridesListContext.filters.date_start)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('yyyy-LL-dd HH:mm:ss');
	}, [ridesListContext.filters.date_start]);

	//
	// C. Handle actions

	const handleChange = (value: null | string) => {
		if (!value) {
			ridesListContext.actions.setFilterDateStart(null);
			return;
		}
		const parsedValue = Dates.fromFormat(value, 'yyyy-LL-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp;
		ridesListContext.actions.setFilterDateStart(parsedValue);
	};

	//
	// C. Render components

	return (
		<DateTimePicker
			onChange={handleChange}
			placeholder="start"
			value={valueAsString}
			clearable
		/>
	);

	//
}
