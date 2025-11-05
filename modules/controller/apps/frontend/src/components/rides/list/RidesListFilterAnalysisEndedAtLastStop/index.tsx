/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { RIDE_ANALYSIS_GRADE_OPTIONS } from '@tmlmobilidade/go-types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RidesListFilterAnalysisEndedAtLastStop() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'];
		const enabledValues = ridesListContext.filters.analysis_ended_at_last_stop;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [ridesListContext.filters.analysis_ended_at_last_stop]);

	const parsedOptions = useMemo(() => {
		// Parse options to the expected format.
		return [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'].map(value => ({
			checked: ridesListContext.filters.analysis_ended_at_last_stop.includes(value),
			label: value,
			value: value,
		}));
	}, [ridesListContext.filters.analysis_ended_at_last_stop]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Fim na Última Paragem"
			onChange={ridesListContext.actions.setFilterAnalysisEndedAtLastStop}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
