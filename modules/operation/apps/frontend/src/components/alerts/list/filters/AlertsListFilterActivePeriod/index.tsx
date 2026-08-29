/* * */

import { DateRangeFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterActivePeriod } from './use-alerts-list-filter-active-period';

/* * */

export function AlertsListFilterActivePeriod() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterActivePeriod = useAlertsListFilterActivePeriod();

	//
	// B. Render components

	return (
		<DateRangeFilter
			active={filterActivePeriod.isActive}
			endDate={filterActivePeriod.value_end}
			label={t('alerts:list.filters.active_period.label')}
			onEndDateChange={filterActivePeriod.setEnd}
			onStartDateChange={filterActivePeriod.setStart}
			startDate={filterActivePeriod.value_start}
		/>
	);
}
