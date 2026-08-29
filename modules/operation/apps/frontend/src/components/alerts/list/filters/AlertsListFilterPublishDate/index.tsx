/* * */

import { DateRangeFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterPublishDate } from './use-alerts-list-filter-publish-date';

/* * */

export function AlertsListFilterPublishDate() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterPublishDate = useAlertsListFilterPublishDate();

	//
	// B. Render components

	return (
		<DateRangeFilter
			active={filterPublishDate.isActive}
			endDate={filterPublishDate.value_end}
			label={t('alerts:list.filters.publish_date.label')}
			onEndDateChange={filterPublishDate.setEnd}
			onStartDateChange={filterPublishDate.setStart}
			startDate={filterPublishDate.value_start}
		/>
	);
}
