/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAnalysisExpectedApexValidationInterval } from './use-rides-list-filter-analysis-expected-apex-validation-interval';

/* * */

export function RidesListFilterAnalysisExpectedApexValidationInterval() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAnalysisExpectedApexValidationInterval = useRidesListFilterAnalysisExpectedApexValidationInterval();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAnalysisExpectedApexValidationInterval.isActive}
			label={t('default:list.RidesListFilterAnalysisExpectedApexValidationInterval.label')}
			onChange={filterAnalysisExpectedApexValidationInterval.set}
			options={filterAnalysisExpectedApexValidationInterval.options}
			withToggleAll
		/>
	);
}
