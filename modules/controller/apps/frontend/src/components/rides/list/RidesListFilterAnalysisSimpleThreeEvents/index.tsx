/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterAnalysisSimpleThreeEvents() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_simple_three_vehicle_events_grade.isActive}
			label="3 Momentos"
			onChange={ridesListContext.filters.analysis_simple_three_vehicle_events_grade.set}
			options={ridesListContext.filters.analysis_simple_three_vehicle_events_grade.options}
			withToggleAll
		/>
	);

	//
}
