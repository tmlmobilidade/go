/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { type UnixTimestamp } from '@go/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterDateRange() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Handle actions

	const handleStartDateChange = (value: UnixTimestamp) => {
		ridesListContext.actions.setFilterDateStart(value);
	};

	const handleEndDateChange = (value: UnixTimestamp) => {
		ridesListContext.actions.setFilterDateEnd(value);
	};

	//
	// C. Render components

	return (
		<FilterTypeDateRange
			active={true}
			endDate={ridesListContext.filters.date_end as UnixTimestamp}
			label="Intervalo de Datas"
			onEndDateChange={handleEndDateChange}
			onStartDateChange={handleStartDateChange}
			startDate={ridesListContext.filters.date_start as UnixTimestamp}
		/>
	);

	//
}
