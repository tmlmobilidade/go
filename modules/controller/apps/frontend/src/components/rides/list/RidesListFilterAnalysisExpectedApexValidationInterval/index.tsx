/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAnalysisExpectedApexValidationInterval() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_expected_apex_validation_interval.isActive}
			label={t('default:list.RidesListFilterAnalysisExpectedApexValidationInterval.label')}
			onChange={ridesListContext.filters.analysis_expected_apex_validation_interval.set}
			options={ridesListContext.filters.analysis_expected_apex_validation_interval.options}
			withToggleAll
		/>
	);

	//
}
