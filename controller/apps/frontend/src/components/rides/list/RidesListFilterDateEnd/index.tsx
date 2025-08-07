/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { DateTimePicker } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

/* * */

export function RidesListFilterDateEnd() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValue = null;
		const enabledValue = ridesListContext.filters.date_end;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValue !== enabledValue) return true;
	}, [ridesListContext.filters.date_end]);

	const valueAsString = useMemo(() => {
		if (!ridesListContext.filters.date_end) return null;
		return Dates
			.fromUnixTimestamp(ridesListContext.filters.date_end)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('yyyy-LL-dd HH:mm:ss');
	}, [ridesListContext.filters.date_end]);

	//
	// C. Handle actions

	const handleChange = (value: string) => {
		const parsedValue = Dates.fromFormat(value, 'yyyy-LL-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp;
		ridesListContext.actions.setFilterDateEnd(parsedValue);
	};

	//
	// C. Render components

	return (
		<DateTimePicker
			onChange={handleChange}
			placeholder="end"
			value={valueAsString}
			clearable
		/>
	);

	//
}
