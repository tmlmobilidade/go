/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAnalysisSimpleThreeEvents() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_simple_three_vehicle_events_grade.isActive}
			label={t('default:list.RidesListFilterAnalysisSimpleThreeEvents.label')}
			onChange={ridesListContext.filters.analysis_simple_three_vehicle_events_grade.set}
			options={ridesListContext.filters.analysis_simple_three_vehicle_events_grade.options}
			withToggleAll
		/>
	);

	//
}
