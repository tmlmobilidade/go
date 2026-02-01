/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterAnalysisEndedAtLastStop() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_ended_at_last_stop.isActive}
			label="Fim na Última Paragem"
			onChange={ridesListContext.filters.analysis_ended_at_last_stop.set}
			options={ridesListContext.filters.analysis_ended_at_last_stop.options}
			withToggleAll
		/>
	);

	//
}
