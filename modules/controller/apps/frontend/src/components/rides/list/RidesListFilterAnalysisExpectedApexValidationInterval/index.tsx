/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { RIDE_ANALYSIS_GRADE_OPTIONS } from '@tmlmobilidade/types';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAnalysisExpectedApexValidationInterval() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation('controller', { keyPrefix: 'rides.list.filterBar.analysisExpectedApexValidationInterval' });

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'];
		const enabledValues = ridesListContext.filters.analysis_expected_apex_validation_interval;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [ridesListContext.filters.analysis_expected_apex_validation_interval]);

	const parsedOptions = useMemo(() => {
		// Parse options to the expected format.
		return [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'].map(value => ({
			checked: ridesListContext.filters.analysis_expected_apex_validation_interval.includes(value),
			label: value,
			value: value,
		}));
	}, [ridesListContext.filters.analysis_expected_apex_validation_interval]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('label')}
			onChange={ridesListContext.actions.setFilterAnalysisExpectedApexValidationInterval}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
