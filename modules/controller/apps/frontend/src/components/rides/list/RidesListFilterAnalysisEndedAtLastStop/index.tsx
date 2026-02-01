/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAnalysisEndedAtLastStop() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_ended_at_last_stop.isActive}
			label={t('default:list.RidesListFilterAnalysisEndedAtLastStop.label')}
			onChange={ridesListContext.filters.analysis_ended_at_last_stop.set}
			options={ridesListContext.filters.analysis_ended_at_last_stop.options}
			withToggleAll
		/>
	);

	//
}
