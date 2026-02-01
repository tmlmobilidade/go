/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterAnalysisExpectedApexValidationInterval() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_expected_apex_validation_interval.isActive}
			label="Intervalo Validações"
			onChange={ridesListContext.filters.analysis_expected_apex_validation_interval.set}
			options={ridesListContext.filters.analysis_expected_apex_validation_interval.options}
			withToggleAll
		/>
	);

	//
}
