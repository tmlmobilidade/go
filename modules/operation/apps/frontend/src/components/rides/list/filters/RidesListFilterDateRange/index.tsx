/* * */

import { DateRangeFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterDateRange } from './use-rides-list-filter-date-range';

/* * */

export function RidesListFilterDateRange() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterDateRange = useRidesListFilterDateRange();

	//
	// B. Render components

	return (
		<DateRangeFilter
			active={filterDateRange.isActive}
			endDate={filterDateRange.value_end}
			label={t('default:list.RidesListFilterDateRange.label')}
			onEndDateChange={filterDateRange.setEnd}
			onStartDateChange={filterDateRange.setStart}
			startDate={filterDateRange.value_start}
		/>
	);
}
